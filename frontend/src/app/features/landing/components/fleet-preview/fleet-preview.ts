import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FleetMapMarker, Vehicle } from '../../../../core/models/fleet.models';
import { FleetService } from '../../../../core/services/fleet.service';
import { toFleetMarker } from '../../../../core/utils/map-markers';
import {
  POLICY_STATUS_BADGE,
  POLICY_STATUS_LABEL,
  UNIT_STATUS_LABEL,
  formatKm,
  formatNumber,
  formatPhone,
  relativeTime,
} from '../../../../core/utils/fleet-format';
import { FleetMapComponent } from '../../../../shared/components/fleet-map/fleet-map';

/** Garantías operativas mostradas en la banda de cobertura. */
const COVERAGE_ITEMS = [
  {
    icon: 'bi-geo-alt',
    title: 'Telemetría GPS',
    text: 'Posición, velocidad y rumbo de cada unidad con historial de recorridos.',
  },
  {
    icon: 'bi-file-earmark-check',
    title: 'Control de pólizas',
    text: 'Alertas automáticas de vigencia y renovación por unidad y conductor.',
  },
  {
    icon: 'bi-tools',
    title: 'Mantenimiento preventivo',
    text: 'Servicio programado por kilometraje para evitar paros no planeados.',
  },
  {
    icon: 'bi-headset',
    title: 'Mesa de servicio 24/7',
    text: 'Asistencia vial, reemplazo de unidad y coordinación en sitio.',
  },
] as const;

/**
 * Sección pública "Flota en vivo": mapa interactivo con las unidades
 * activas, listado sincronizado y banda de cobertura operativa.
 */
@Component({
  selector: 'vf-fleet-preview',
  imports: [RouterLink, FleetMapComponent],
  templateUrl: './fleet-preview.html',
  styleUrl: './fleet-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetPreviewComponent {
  private readonly fleet = inject(FleetService);

  /** Unidades de la flota. */
  readonly vehicles = this.fleet.vehicles;

  /** Resumen agregado. */
  readonly summary = this.fleet.summary;

  /** Origen de los datos (API o mock). */
  readonly dataSource = this.fleet.dataSource;

  /** Garantías operativas. */
  readonly coverage = COVERAGE_ITEMS;

  /** Unidad resaltada en el mapa. */
  readonly selectedId = signal<string | null>(null);

  /** Marcadores del mapa derivados de la flota. */
  readonly markers = computed<FleetMapMarker[]>(() =>
    this.vehicles().map((vehicle) => toFleetMarker(vehicle)),
  );

  /** Unidad seleccionada actualmente. */
  readonly selectedUnit = computed<Vehicle | null>(
    () => this.vehicles().find((v) => v.id === this.selectedId()) ?? null,
  );

  // Helpers expuestos a la plantilla
  readonly policyBadge = POLICY_STATUS_BADGE;
  readonly policyLabel = POLICY_STATUS_LABEL;
  readonly unitStatusLabel = UNIT_STATUS_LABEL;
  readonly formatKm = formatKm;
  readonly formatNumber = formatNumber;
  readonly formatPhone = formatPhone;
  readonly relativeTime = relativeTime;

  /** Resalta una unidad en el mapa. */
  select(vehicle: Vehicle): void {
    this.selectedId.set(vehicle.id);
  }
}
