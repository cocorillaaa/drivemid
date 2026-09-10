import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FleetMapMarker, PublicVehicle } from '../../../../core/models/fleet.models';
import { LandingService } from '../../../../core/services/landing.service';
import { toPublicFleetMarker } from '../../../../core/utils/map-markers';
import {
  POLICY_STATUS_BADGE,
  POLICY_STATUS_LABEL,
  UNIT_STATUS_LABEL,
  formatKm,
  formatNumber,
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
 * Sección pública "Flota en vivo".
 *
 * Consume la vista pública de la flota: la API entrega únicamente los datos
 * operativos y el nombre de pila del conductor, nunca su información de
 * contacto, porque la landing no requiere autenticación.
 */
@Component({
  selector: 'vf-fleet-preview',
  imports: [RouterLink, FleetMapComponent],
  templateUrl: './fleet-preview.html',
  styleUrl: './fleet-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetPreviewComponent {
  private readonly landing = inject(LandingService);

  /** Flota publicada por la API. */
  readonly units = this.landing.fleet;

  /** Resumen agregado de la flota. */
  readonly summary = this.landing.summary;

  /** `true` mientras el contenido se carga. */
  readonly loading = this.landing.loading;

  /** Garantías operativas. */
  readonly coverage = COVERAGE_ITEMS;

  /** Unidad resaltada en el mapa. */
  readonly selectedId = signal<string | null>(null);

  /** Marcadores del mapa derivados de la flota pública. */
  readonly markers = computed<FleetMapMarker[]>(() =>
    this.units().map((unit) => toPublicFleetMarker(unit)),
  );

  /** Unidad seleccionada actualmente. */
  readonly selectedUnit = computed<PublicVehicle | null>(
    () => this.units().find((u) => u.id === this.selectedId()) ?? null,
  );

  /** Unidad mostrada en el resumen inferior del listado. */
  readonly highlightedUnit = computed<PublicVehicle | null>(
    () => this.selectedUnit() ?? this.units()[0] ?? null,
  );

  // Helpers expuestos a la plantilla
  readonly policyBadge = POLICY_STATUS_BADGE;
  readonly policyLabel = POLICY_STATUS_LABEL;
  readonly unitStatusLabel = UNIT_STATUS_LABEL;
  readonly formatKm = formatKm;
  readonly formatNumber = formatNumber;
  readonly relativeTime = relativeTime;

  /** Resalta una unidad en el mapa. */
  select(unit: PublicVehicle): void {
    this.selectedId.set(unit.id);
  }
}
