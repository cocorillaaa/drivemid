import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LandingService } from '../../../../core/services/landing.service';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

/**
 * Hero de la landing: propuesta de valor de movilidad ejecutiva.
 *
 * La pieza visual es una ilustración, no un panel con datos: la landing es
 * pública y no debe mostrar información de la aplicación.
 */
@Component({
  selector: 'dl-hero',
  imports: [RouterLink, RevealDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  private readonly landing = inject(LandingService);

  /**
   * Logo en su variante clara: el hero tiene fondo oscuro y la versión
   * original (negra) no sería visible.
   */
  readonly heroImage = 'images/logo-claro.png';

  /** Pilares institucionales mostrados bajo el hero. */
  readonly pillars = this.landing.pillars;

  /** `true` mientras el contenido se carga. */
  readonly loading = this.landing.loading;
}
