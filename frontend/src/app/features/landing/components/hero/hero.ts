import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LandingService } from '../../../../core/services/landing.service';
import {
  UNIT_STATUS_BADGE,
  UNIT_STATUS_LABEL,
  formatNumber,
} from '../../../../core/utils/fleet-format';

/**
 * Hero de la landing: propuesta de valor de movilidad ejecutiva, llamado a la
 * acción y panel ilustrativo con la flota real publicada por el backend.
 */
@Component({
  selector: 'dl-hero',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  private readonly landing = inject(LandingService);

  /** Indicadores institucionales. */
  readonly metrics = this.landing.metrics;

  /** Resumen agregado de la flota. */
  readonly summary = this.landing.summary;

  /** Flota publicada (sin datos personales). */
  readonly units = this.landing.fleet;

  /** `true` mientras el contenido se carga. */
  readonly loading = this.landing.loading;

  /** Helpers expuestos a la plantilla. */
  readonly formatNumber = formatNumber;
  readonly unitStatusLabel = UNIT_STATUS_LABEL;
  readonly unitStatusBadge = UNIT_STATUS_BADGE;
}
