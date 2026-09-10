import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
} from '@angular/core';

import { Vehicle } from '../../../core/models/fleet.models';
import {
  POLICY_STATUS_BADGE,
  POLICY_STATUS_LABEL,
  UNIT_STATUS_BADGE,
  UNIT_STATUS_LABEL,
  WEEK_DAYS_SHORT,
  formatDate,
  formatKm,
  formatPhone,
  policyCountdownText,
  relativeTime,
} from '../../../core/utils/fleet-format';

/**
 * Ficha técnica de una unidad en ventana modal.
 *
 * Se controla con Signals desde el componente padre (sin el JavaScript de
 * Bootstrap): el padre decide qué unidad mostrar y escucha el cierre.
 */
@Component({
  selector: 'dl-unit-detail-modal',
  templateUrl: './unit-detail-modal.html',
  styleUrl: './unit-detail-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitDetailModalComponent {
  /** Unidad a mostrar. */
  readonly vehicle = input.required<Vehicle>();

  /** Se emite al cerrar la ventana. */
  readonly closed = output<void>();

  /** Porcentaje de avance hacia el siguiente servicio preventivo. */
  readonly servicePct = computed(() => {
    const v = this.vehicle();
    const span = Math.max(v.nextServiceKm - v.lastServiceKm, 1);
    const done = v.odometerKm - v.lastServiceKm;
    return Math.min(100, Math.max(0, Math.round((done / span) * 100)));
  });

  /** Porcentaje de vigencia de la póliza consumido. */
  readonly policyPct = computed(() => {
    const { validFrom, validTo } = this.vehicle().policy;
    const start = Date.parse(`${validFrom}T00:00:00Z`);
    const end = Date.parse(`${validTo}T00:00:00Z`);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
    return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / (end - start)) * 100)));
  });

  /** Máximo de km diarios para escalar las barras. */
  readonly maxDailyKm = computed(() => Math.max(...this.vehicle().weeklyKmByDay, 1));

  // Helpers expuestos a la plantilla
  readonly weekDays = WEEK_DAYS_SHORT;
  readonly unitStatusLabel = UNIT_STATUS_LABEL;
  readonly unitStatusBadge = UNIT_STATUS_BADGE;
  readonly policyLabel = POLICY_STATUS_LABEL;
  readonly policyBadge = POLICY_STATUS_BADGE;
  readonly formatKm = formatKm;
  readonly formatDate = formatDate;
  readonly formatPhone = formatPhone;
  readonly relativeTime = relativeTime;
  readonly policyCountdownText = policyCountdownText;

  /** Cierra la ventana modal. */
  close(): void {
    this.closed.emit();
  }

  /** Cierra con la tecla Escape. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
