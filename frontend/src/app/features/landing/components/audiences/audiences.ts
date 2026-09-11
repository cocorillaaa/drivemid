import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LandingService } from '../../../../core/services/landing.service';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

/**
 * Público del programa: inversionistas y conductores.
 *
 * Sustituye a las antiguas tarjetas de "soluciones" de transporte corporativo,
 * que describían un negocio que el cliente no tiene.
 */
@Component({
  selector: 'dl-audiences',
  imports: [RevealDirective],
  templateUrl: './audiences.html',
  styleUrl: './audiences.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudiencesComponent {
  private readonly landing = inject(LandingService);

  readonly audiences = this.landing.audiences;
}
