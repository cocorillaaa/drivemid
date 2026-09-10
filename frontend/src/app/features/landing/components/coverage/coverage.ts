import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { CoverageZone, FleetMapMarker } from '../../../../core/models/fleet.models';
import { LandingService } from '../../../../core/services/landing.service';
import { toCoverageMarker } from '../../../../core/utils/map-markers';
import { FleetMapComponent } from '../../../../shared/components/fleet-map/fleet-map';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

/**
 * Sección de cobertura operativa.
 *
 * El mapa muestra **zonas comerciales de servicio**, no la posición de las
 * unidades: la landing es pública y no publica datos operativos.
 */
@Component({
  selector: 'dl-coverage',
  imports: [FleetMapComponent, RevealDirective],
  templateUrl: './coverage.html',
  styleUrl: './coverage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverageComponent {
  private readonly landing = inject(LandingService);

  /** Zonas de cobertura publicadas por la API. */
  readonly zones = this.landing.coverageZones;

  /** `true` mientras el contenido se carga. */
  readonly loading = this.landing.loading;

  /** Zona resaltada en el mapa. */
  readonly selectedKey = signal<string | null>(null);

  /** Marcadores del mapa derivados de las zonas. */
  readonly markers = computed<FleetMapMarker[]>(() =>
    this.zones().map((zone) => toCoverageMarker(zone)),
  );

  /** Zona seleccionada. */
  readonly selectedZone = computed<CoverageZone | null>(
    () => this.zones().find((zone) => zone.key === this.selectedKey()) ?? null,
  );

  /** Resalta una zona en el mapa. */
  select(zone: CoverageZone): void {
    this.selectedKey.set(zone.key);
  }
}
