import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LandingService } from '../../../../core/services/landing.service';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

/**
 * Portada del sitio.
 *
 * La pieza visual es el logotipo del cliente, no un panel con datos: el sitio
 * es público y no debe mostrar información de la aplicación.
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

  /** Nombre de la marca (servido por la API). */
  readonly brandName = computed(() => this.landing.brand()?.name ?? 'Drive Mid');

  /** Compromisos del programa, sin indicadores de estado. */
  readonly assurances: readonly string[] = [
    'Activo identificable por unidad',
    'Reserva de riesgo y depósito en garantía',
    'Reporte periódico de la operación',
  ];
}
