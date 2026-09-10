import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, throwError, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MOCK_VEHICLES, buildFleetSummary } from '../data/fleet-mock.data';
import {
  CorporateLeadPayload,
  DataSource,
  DriverApplicationPayload,
  FleetSummary,
  UnitUpdatePayload,
  Vehicle,
} from '../models/fleet.models';
import { FleetApiService } from './fleet-api.service';
import { ToastService } from './toast.service';

/** Fila enriquecida de la tabla general de flota. */
export interface FleetRow {
  vehicle: Vehicle;
  /** Km promedio por día de la semana en curso. */
  dailyAverageKm: number;
  /** Km restantes para el siguiente servicio preventivo. */
  kmToNextService: number;
  /** `true` si el servicio preventivo ya venció. */
  serviceOverdue: boolean;
  /** Porcentaje de avance hacia el siguiente servicio (0-100). */
  serviceProgressPct: number;
  /** `true` si la póliza exige acción del administrador. */
  needsPolicyAction: boolean;
}

/**
 * Servicio central de la flota.
 *
 * Expone el estado como Signals de solo lectura y concentra la lógica de
 * negocio de la demo:
 *
 * - Carga la flota desde la API de Laravel (puerto 8001).
 * - Si la API no está disponible, degrada automáticamente al dataset mock
 *   local para que el prototipo siempre sea navegable.
 * - Mantiene métricas derivadas (`summary`) recalculadas de forma reactiva.
 * - Permite al Administrador de Unidad actualizar kilometraje y teléfono.
 */
@Injectable({ providedIn: 'root' })
export class FleetService {
  private readonly api = inject(FleetApiService);
  private readonly toast = inject(ToastService);

  private readonly _vehicles = signal<Vehicle[]>([]);
  private readonly _loading = signal(false);
  private readonly _source = signal<DataSource>('mock');
  private readonly _lastSync = signal<string>(new Date().toISOString());
  private readonly _savingUnitId = signal<string | null>(null);
  private readonly _apiReachable = signal(false);

  /** Unidades de la flota. */
  readonly vehicles = this._vehicles.asReadonly();

  /** `true` mientras se consulta la API. */
  readonly loading = this._loading.asReadonly();

  /** Origen de los datos actualmente en pantalla. */
  readonly dataSource = this._source.asReadonly();

  /** Marca de tiempo del último refresco exitoso. */
  readonly lastSync = this._lastSync.asReadonly();

  /** `true` cuando la API de Laravel respondió correctamente. */
  readonly apiReachable = this._apiReachable.asReadonly();

  /** Id de la unidad que se está guardando (para estados de carga por fila). */
  readonly savingUnitId = this._savingUnitId.asReadonly();

  /** Métricas agregadas para las tarjetas ejecutivas del dashboard. */
  readonly summary = computed<FleetSummary>(() =>
    buildFleetSummary(this._vehicles(), this._lastSync()),
  );

  /** Filas enriquecidas para la tabla general de flota. */
  readonly rows = computed<FleetRow[]>(() => this._vehicles().map((v) => toFleetRow(v)));

  /** Total de vehículos activos (no en mantenimiento). */
  readonly activeUnits = computed(() => this.summary().activeUnits);

  /** Km totales recorridos por la flota en la semana. */
  readonly totalWeeklyKm = computed(() => this.summary().totalWeeklyKm);

  /** Alertas de pólizas (vencidas + por vencer). */
  readonly policyAlerts = computed(() => this.summary().policyAlerts);

  /** Unidades con póliza vencida. */
  readonly expiredPolicyUnits = computed(() =>
    this._vehicles().filter((v) => v.policy.status === 'vencida'),
  );

  /**
   * Carga (o recarga) la flota.
   *
   * @param opts.silent evita mostrar toasts de error cuando se refresca en background.
   */
  load(opts: { silent?: boolean } = {}): void {
    this._loading.set(true);

    this.api
      .getVehicles()
      .pipe(
        timeout(environment.apiTimeoutMs),
        catchError(() => {
          this._apiReachable.set(false);
          this._source.set('mock');
          if (!opts.silent) {
            this.toast.warning(
              'Modo demostración activo',
              'No se pudo contactar la API en el puerto 8001. Se muestran los datos mock locales.',
            );
          }
          return of(MOCK_VEHICLES);
        }),
        tap((vehicles) => {
          if (vehicles.length > 0) {
            this._apiReachable.set(true);
            this._source.set('api');
          }
          this._vehicles.set(vehicles.length > 0 ? vehicles : MOCK_VEHICLES);
        }),
        finalize(() => {
          this._lastSync.set(new Date().toISOString());
          this._loading.set(false);
        }),
      )
      .subscribe();
  }

  /** Refresco silencioso para el botón "Actualizar" del panel. */
  refresh(): void {
    this.load({ silent: true });
  }

  /**
   * Carga la flota sólo si aún no hay datos en memoria.
   * Evita peticiones duplicadas al alternar entre landing y plataforma.
   */
  ensureLoaded(opts: { silent?: boolean } = {}): void {
    if (this._vehicles().length === 0 && !this._loading()) {
      this.load(opts);
    }
  }

  /** Obtiene una unidad por id. */
  getById(id: string): Vehicle | undefined {
    return this._vehicles().find((v) => v.id === id);
  }

  /** Obtiene una unidad por id como señal derivada. */
  unitById(id: () => string) {
    return computed(() => this.getById(id()));
  }

  /** Indica si una unidad tiene póliza vencida o próxima a vencer. */
  hasPolicyAlert(vehicle: Vehicle): boolean {
    return vehicle.policy.status !== 'vigente';
  }

  /**
   * Actualiza el kilometraje semanal y/o el teléfono de contacto de una unidad.
   * Aplica el cambio de forma optimista y revierte si la API falla.
   */
  updateUnit(id: string, payload: UnitUpdatePayload): Observable<Vehicle> {
    const previous = this.getById(id);
    if (!previous) return throwError(() => new Error(`Unidad ${id} no encontrada.`));

    const optimistic: Vehicle = {
      ...previous,
      weeklyKm: payload.weeklyKm ?? previous.weeklyKm,
      weeklyKmByDay: payload.weeklyKm != null
        ? redistributeWeekly(previous.weeklyKmByDay, payload.weeklyKm)
        : previous.weeklyKmByDay,
      driver: {
        ...previous.driver,
        phone: payload.phone ?? previous.driver.phone,
      },
    };

    this.applyLocalUpdate(optimistic);
    this._savingUnitId.set(id);

    return this.api.updateUnit(id, payload).pipe(
      timeout(environment.apiTimeoutMs),
      tap((updated) => {
        this.applyLocalUpdate({ ...updated, location: updated.location ?? previous.location });
        this._lastSync.set(new Date().toISOString());
        this.toast.success(
          `${updated.unitCode} actualizada`,
          'Los datos de la unidad se sincronizaron con la plataforma.',
        );
      }),
      catchError(() => {
        this.applyLocalUpdate(previous);
        this.toast.info(
          'Cambio guardado localmente',
          'La API no respondió; el ajuste se conserva en la sesión de demostración.',
        );
        return of(optimistic);
      }),
      finalize(() => this._savingUnitId.set(null)),
    );
  }

  /** Registra una solicitud de servicio corporativo desde la landing. */
  submitCorporateLead(payload: CorporateLeadPayload): Observable<{ reference: string }> {
    return this.api.createCorporateLead(payload).pipe(
      timeout(environment.apiTimeoutMs),
      map((res) => ({ reference: res.reference })),
      catchError(() => of({ reference: buildLocalReference('COR') })),
    );
  }

  /** Registra una postulación de conductor desde la landing. */
  submitDriverApplication(payload: DriverApplicationPayload): Observable<{ reference: string }> {
    return this.api.createDriverApplication(payload).pipe(
      timeout(environment.apiTimeoutMs),
      map((res) => ({ reference: res.reference })),
      catchError(() => of({ reference: buildLocalReference('CON') })),
    );
  }

  private applyLocalUpdate(vehicle: Vehicle): void {
    this._vehicles.update((list) =>
      list.map((v) => (v.id === vehicle.id ? { ...vehicle } : v)),
    );
  }
}

/** Deriva la fila enriquecida usada por la tabla general. */
export function toFleetRow(vehicle: Vehicle): FleetRow {
  const serviceSpan = Math.max(vehicle.nextServiceKm - vehicle.lastServiceKm, 1);
  const progressed = vehicle.odometerKm - vehicle.lastServiceKm;
  const kmToNextService = vehicle.nextServiceKm - vehicle.odometerKm;

  return {
    vehicle,
    dailyAverageKm: Math.round(vehicle.weeklyKm / 7),
    kmToNextService,
    serviceOverdue: kmToNextService <= 0,
    serviceProgressPct: Math.min(100, Math.max(0, Math.round((progressed / serviceSpan) * 100))),
    needsPolicyAction: vehicle.policy.status !== 'vigente',
  };
}

/** Reparte un total semanal entre los 7 días conservando la forma de la serie. */
function redistributeWeekly(series: number[], total: number): number[] {
  const base = series.length === 7 ? series : [1, 1, 1, 1, 1, 1, 1];
  const weightSum = base.reduce((acc, n) => acc + n, 0) || 7;
  const scaled = base.map((n) => Math.round((n / weightSum) * total));

  const drift = total - scaled.reduce((acc, n) => acc + n, 0);
  scaled[scaled.length - 1] += drift;
  return scaled.map((n) => Math.max(0, n));
}

/** Folio local cuando la API no está disponible. */
function buildLocalReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  return `VF-${prefix}-${stamp}`;
}
