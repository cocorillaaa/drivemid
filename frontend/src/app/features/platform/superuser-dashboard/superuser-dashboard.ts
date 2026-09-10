import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { FleetMapMarker, Vehicle } from '../../../core/models/fleet.models';
import { FleetRow, FleetService } from '../../../core/services/fleet.service';
import { ToastService } from '../../../core/services/toast.service';
import { toFleetMarker } from '../../../core/utils/map-markers';
import { ClipboardService } from '../../../core/services/clipboard.service';
import {
  ContactModalComponent,
  ContactTarget,
} from '../../../shared/components/contact-modal/contact-modal';
import {
  POLICY_STATUS_BADGE,
  POLICY_STATUS_LABEL,
  UNIT_STATUS_BADGE,
  UNIT_STATUS_LABEL,
  WEEK_DAYS_SHORT,
  formatDateShort,
  formatKm,
  formatNumber,
  formatPhone,
  policyCountdownText,
  relativeTime,
} from '../../../core/utils/fleet-format';
import { FleetMapComponent } from '../../../shared/components/fleet-map/fleet-map';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { UnitDetailModalComponent } from '../../../shared/components/unit-detail-modal/unit-detail-modal';

/** Filtro rápido de la tabla general de flota. */
type FleetFilter = 'all' | 'alerts' | 'service';

/**
 * Dashboard del rol "Superusuario": vista global de la flota.
 *
 * Concentra las métricas ejecutivas, la tabla general de las 4 unidades,
 * el mapa interactivo con los marcadores activos y el panel de alertas
 * de pólizas.
 */
@Component({
  selector: 'dl-superuser-dashboard',
  imports: [
    StatCardComponent,
    FleetMapComponent,
    UnitDetailModalComponent,
    ContactModalComponent,
  ],
  templateUrl: './superuser-dashboard.html',
  styleUrl: './superuser-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperuserDashboard {
  private readonly fleet = inject(FleetService);
  private readonly toast = inject(ToastService);
  private readonly clipboard = inject(ClipboardService);

  /** Resumen agregado de la flota. */
  readonly summary = this.fleet.summary;

  /** Filas enriquecidas de la tabla. */
  readonly rows = this.fleet.rows;

  /** Unidades crudas. */
  readonly vehicles = this.fleet.vehicles;

  /** Filtro activo de la tabla. */
  readonly filter = signal<FleetFilter>('all');

  /** Unidad resaltada en el mapa. */
  readonly selectedMapId = signal<string | null>(null);

  /** Unidad abierta en la ficha técnica (null = modal cerrado). */
  readonly detailUnitId = signal<string | null>(null);

  /** Unidad cuyo contacto se está mostrando (null = modal cerrado). */
  readonly contactUnitId = signal<string | null>(null);

  /** Datos de contacto de la unidad seleccionada. */
  readonly contactTarget = computed<ContactTarget | null>(() => {
    const unit = this.vehicles().find((v) => v.id === this.contactUnitId());
    if (!unit) return null;

    return {
      name: unit.driver.fullName,
      role: `Conductor asignado · ${unit.serviceTier}`,
      context: `${unit.unitCode} · ${unit.plates}`,
      phone: unit.driver.phone,
      email: unit.driver.email,
    };
  });

  /** Unidad del modal. */
  readonly detailUnit = computed<Vehicle | null>(
    () => this.vehicles().find((v) => v.id === this.detailUnitId()) ?? null,
  );

  /** Filas visibles según el filtro. */
  readonly visibleRows = computed<FleetRow[]>(() => {
    const rows = this.rows();
    switch (this.filter()) {
      case 'alerts':
        return rows.filter((row) => row.needsPolicyAction);
      case 'service':
        return rows.filter((row) => row.serviceProgressPct >= 80);
      default:
        return rows;
    }
  });

  /** Marcadores del mapa. */
  readonly markers = computed<FleetMapMarker[]>(() =>
    this.vehicles().map((vehicle) => toFleetMarker(vehicle)),
  );

  /** Unidades que requieren acción sobre su póliza, ordenadas por urgencia. */
  readonly policyAlertUnits = computed<Vehicle[]>(() =>
    this.vehicles()
      .filter((v) => v.policy.status !== 'vigente')
      .sort((a, b) => a.policy.daysToExpire - b.policy.daysToExpire),
  );

  /** Km máximos de la flota, para escalar las barras comparativas. */
  readonly maxWeeklyKm = computed(() =>
    Math.max(...this.vehicles().map((v) => v.weeklyKm), 1),
  );

  /** Km máximos registrados en un solo día por cualquier unidad de la flota. */
  readonly maxDailyKm = computed(() =>
    Math.max(...this.vehicles().flatMap((v) => v.weeklyKmByDay), 1),
  );

  /** Unidad con mayor kilometraje semanal. */
  readonly topUnit = computed<Vehicle | null>(() => {
    const list = [...this.vehicles()].sort((a, b) => b.weeklyKm - a.weeklyKm);
    return list[0] ?? null;
  });

  // Helpers expuestos a la plantilla
  readonly weekDays = WEEK_DAYS_SHORT;
  readonly policyBadge = POLICY_STATUS_BADGE;
  readonly policyLabel = POLICY_STATUS_LABEL;
  readonly unitStatusBadge = UNIT_STATUS_BADGE;
  readonly unitStatusLabel = UNIT_STATUS_LABEL;
  readonly formatKm = formatKm;
  readonly formatNumber = formatNumber;
  readonly formatPhone = formatPhone;
  readonly formatDateShort = formatDateShort;
  readonly relativeTime = relativeTime;
  readonly policyCountdownText = policyCountdownText;

  /** Cambia el filtro de la tabla. */
  setFilter(filter: FleetFilter): void {
    this.filter.set(filter);
  }

  /** Resalta una unidad en el mapa y desplaza la vista hacia él. */
  locateOnMap(vehicle: Vehicle): void {
    this.selectedMapId.set(vehicle.id);
    globalThis.document
      ?.getElementById('dl-fleet-map-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /** Abre la ficha técnica de una unidad. */
  openDetail(id: string): void {
    this.detailUnitId.set(id);
  }

  /** Cierra la ficha técnica. */
  closeDetail(): void {
    this.detailUnitId.set(null);
  }

  /** Abre la ficha de contacto de una unidad. */
  openContact(id: string): void {
    this.contactUnitId.set(id);
  }

  /** Cierra la ficha de contacto. */
  closeContact(): void {
    this.contactUnitId.set(null);
  }

  /** Copia el teléfono del conductor sin salir de la plataforma. */
  copyDriverPhone(phone: string): void {
    this.clipboard.copy(`+52 ${formatPhone(phone)}`, 'Teléfono');
  }

  /** Exporta la tabla general a CSV (sin backend, 100% cliente). */
  exportCsv(): void {
    const header = [
      'Unidad',
      'Modelo',
      'Placas',
      'Conductor',
      'Telefono',
      'Poliza',
      'Aseguradora',
      'Vigencia',
      'Estatus poliza',
      'Km semana',
      'Ultima ubicacion',
    ];

    const lines = this.vehicles().map((v) =>
      [
        v.unitCode,
        `${v.make} ${v.model} ${v.year}`,
        v.plates,
        v.driver.fullName,
        v.driver.phone,
        v.policy.policyNumber,
        v.policy.provider,
        `${v.policy.validFrom} / ${v.policy.validTo}`,
        POLICY_STATUS_LABEL[v.policy.status],
        String(v.weeklyKm),
        v.location.label,
      ]
        .map(csvCell)
        .join(','),
    );

    const csv = [header.map(csvCell).join(','), ...lines].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `demo-logistics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.toast.success('Reporte exportado', 'Se descargó el CSV con las 4 unidades de la flota.');
  }
}

/** Escapa una celda CSV. */
function csvCell(value: string): string {
  const text = String(value ?? '');
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
