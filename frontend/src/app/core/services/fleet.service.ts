import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, forkJoin, map, of, tap, throwError, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FleetSummary, UnitUpdatePayload, Vehicle } from '../models/fleet.models';
import { FleetApiService } from './fleet-api.service';
import { AuthService } from './auth.service';
import { ClockService } from './clock.service';
import { ToastService } from './toast.service';
import { relativeTime } from '../utils/fleet-format';

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

/** Opciones de carga. */
interface LoadOptions {
  /** Evita notificaciones cuando el refresco es automático. */
  silent?: boolean;
}

/**
 * Estado de la flota en el frontend.
 *
 * Todos los datos provienen de la API; el backend decide qué unidades ve cada
 * usuario según su rol. El servicio:
 *
 * - Carga la flota (y las métricas globales si el rol es Superusuario).
 * - Refresca la telemetría automáticamente cada `telemetryRefreshMs`.
 * - Expone `syncAgo`, que se recalcula cada segundo gracias a `ClockService`,
 *   para que el indicador de sincronización avance solo.
 */
@Injectable({ providedIn: 'root' })
export class FleetService {
  private readonly api = inject(FleetApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly clock = inject(ClockService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _vehicles = signal<Vehicle[]>([]);
  private readonly _summary = signal<FleetSummary | null>(null);
  private readonly _loading = signal(false);
  private readonly _refreshing = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastSync = signal<string | null>(null);
  private readonly _savingUnitId = signal<string | null>(null);

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  /** Unidades visibles para el usuario autenticado. */
  readonly vehicles = this._vehicles.asReadonly();

  /** Métricas agregadas (sólo disponible para el Superusuario). */
  readonly summary = this._summary.asReadonly();

  /** `true` durante la primera carga. */
  readonly loading = this._loading.asReadonly();

  /** `true` durante un refresco automático o manual. */
  readonly refreshing = this._refreshing.asReadonly();

  /** Mensaje de error de la última carga, si la hubo. */
  readonly error = this._error.asReadonly();

  /** Marca del último refresco exitoso. */
  readonly lastSync = this._lastSync.asReadonly();

  /** Id de la unidad que se está guardando. */
  readonly savingUnitId = this._savingUnitId.asReadonly();

  /** Fila de la unidad asignada al Administrador de Unidad. */
  readonly assignedUnit = computed<Vehicle | null>(
    () => this._vehicles().find((v) => v.id === this.auth.assignedVehicleId()) ?? this._vehicles()[0] ?? null,
  );

  /** Filas enriquecidas para la tabla general de flota. */
  readonly rows = computed<FleetRow[]>(() => this._vehicles().map((v) => toFleetRow(v)));

  /** Texto "hace X" del indicador de sincronización; se actualiza cada segundo. */
  readonly syncAgo = computed<string>(() => {
    const last = this._lastSync();
    if (!last) return 'sin sincronizar';

    return relativeTime(last, new Date(this.clock.now()));
  });

  /** `true` cuando la telemetría está al día (menos de un minuto). */
  readonly syncFresh = computed<boolean>(() => {
    const last = this._lastSync();
    if (!last) return false;

    return this.clock.now() - new Date(last).getTime() < 60_000;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.stopAutoRefresh());
  }

  /** Carga la flota y, si aplica, las métricas globales. */
  load(options: LoadOptions = {}): void {
    const firstLoad = this._lastSync() === null;

    if (firstLoad) {
      this._loading.set(true);
    } else {
      this._refreshing.set(true);
    }

    const wantsSummary = this.auth.isSuperuser();

    const vehicles$ = this.api.getVehicles();
    const summary$ = wantsSummary ? this.api.getSummary() : of(null);

    forkJoin({ vehicles: vehicles$, summary: summary$ })
      .pipe(
        timeout(environment.apiTimeoutMs),
        tap(({ vehicles, summary }) => {
          this._vehicles.set(vehicles);
          if (summary) this._summary.set(summary);
          this._error.set(null);
          this._lastSync.set(new Date().toISOString());
        }),
        catchError((error: unknown) => {
          const message = describeLoadError(error);
          this._error.set(message);

          if (!options.silent) {
            this.toast.error('No se pudo cargar la flota', message);
          }

          return of(null);
        }),
        finalize(() => {
          this._loading.set(false);
          this._refreshing.set(false);
        }),
      )
      .subscribe();
  }

  /** Fuerza un refresco manual desde la interfaz. */
  refresh(): void {
    this.load({ silent: true });
  }

  /** Arranca el refresco automático de telemetría. */
  startAutoRefresh(): void {
    this.stopAutoRefresh();

    this.pollTimer = setInterval(
      () => this.load({ silent: true }),
      environment.telemetryRefreshMs,
    );
  }

  /** Detiene el refresco automático. */
  stopAutoRefresh(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /** Obtiene una unidad por id dentro del alcance visible. */
  getById(id: string): Vehicle | undefined {
    return this._vehicles().find((v) => v.id === id);
  }

  /**
   * Actualiza kilometraje semanal y/o teléfono de contacto.
   *
   * Aplica el cambio de forma optimista y lo revierte si el backend rechaza
   * la operación.
   */
  updateUnit(id: string, payload: UnitUpdatePayload): Observable<Vehicle> {
    const previous = this.getById(id);

    if (!previous) {
      return throwError(() => new Error(`Unidad ${id} no disponible en la sesión actual.`));
    }

    const optimistic: Vehicle = {
      ...previous,
      weeklyKm: payload.weeklyKm ?? previous.weeklyKm,
      weeklyKmByDay:
        payload.weeklyKm != null
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
        this.applyLocalUpdate(updated);
        this._lastSync.set(new Date().toISOString());
        this.toast.success(
          `${updated.unitCode} actualizada`,
          'La telemetría se sincronizó con la plataforma.',
        );
      }),
      catchError((error: unknown) => {
        this.applyLocalUpdate(previous);
        this.toast.error('No se pudo guardar la actualización', describeUpdateError(error));

        return throwError(() => error);
      }),
      finalize(() => this._savingUnitId.set(null)),
    );
  }

  /** Registra una solicitud de servicio corporativo en el backend. */
  submitCorporateLead(payload: Parameters<FleetApiService['createCorporateLead']>[0]) {
    return this.api.createCorporateLead(payload);
  }

  /** Registra una postulación de conductor en el backend. */
  submitDriverApplication(payload: Parameters<FleetApiService['createDriverApplication']>[0]) {
    return this.api.createDriverApplication(payload);
  }

  private applyLocalUpdate(vehicle: Vehicle): void {
    this._vehicles.update((list) => list.map((v) => (v.id === vehicle.id ? { ...vehicle } : v)));
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

/** Mensaje legible para un fallo de carga de flota. */
function describeLoadError(error: unknown): string {
  const status = (error as { status?: number })?.status;

  if (status === 0 || status === undefined) {
    return `No fue posible contactar el servicio en ${environment.apiBaseUrl}.`;
  }

  if (status === 403) {
    return 'Su usuario no tiene permisos para consultar esta información.';
  }

  return 'Ocurrió un error al consultar la flota. Intente nuevamente.';
}

/** Mensaje legible para un fallo de actualización de unidad. */
function describeUpdateError(error: unknown): string {
  const httpError = error as { status?: number; error?: { message?: string; errors?: Record<string, string[]> } };

  if (httpError?.status === 403) {
    return 'Su usuario sólo puede modificar la unidad que tiene asignada.';
  }

  if (httpError?.status === 422 && httpError.error?.errors) {
    const first = Object.values(httpError.error.errors)[0];
    if (first?.length) return first[0];
  }

  if (httpError?.status === 0) {
    return `No fue posible contactar el servicio en ${environment.apiBaseUrl}.`;
  }

  return 'El servidor rechazó la actualización. Intente nuevamente.';
}
