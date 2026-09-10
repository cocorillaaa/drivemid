import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LANDING_METRICS } from '../../../../core/data/fleet-mock.data';
import { FleetService } from '../../../../core/services/fleet.service';
import {
  UNIT_STATUS_BADGE,
  UNIT_STATUS_LABEL,
  formatNumber,
} from '../../../../core/utils/fleet-format';

/**
 * Hero de la landing: propuesta de valor de movilidad ejecutiva,
 * llamado a la acción y panel ilustrativo alimentado por la flota real.
 */
@Component({
  selector: 'vf-hero',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  private readonly fleet = inject(FleetService);

  /** Indicadores institucionales mostrados al pie del hero. */
  readonly metrics = LANDING_METRICS;

  /** Unidades que se listan en el panel ilustrativo. */
  readonly units = this.fleet.vehicles;

  /** Métricas agregadas para las mini-tarjetas del panel. */
  readonly summary = this.fleet.summary;

  /** Formateador de miles reutilizable en la plantilla. */
  readonly formatNumber = formatNumber;

  /** Etiqueta del estatus operativo. */
  readonly unitStatusLabel = UNIT_STATUS_LABEL;

  /** Clases de la insignia de estatus operativo. */
  readonly unitStatusBadge = UNIT_STATUS_BADGE;
}
