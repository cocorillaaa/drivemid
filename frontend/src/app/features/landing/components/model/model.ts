import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LandingService } from '../../../../core/services/landing.service';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

/**
 * Modelo de negocio: el recorrido del capital hasta el retorno.
 *
 * El cliente pidió expresamente no presentarse como arrendadora; esta sección
 * explica el programa de inversión, no un catálogo de servicios.
 */
@Component({
  selector: 'dl-model',
  imports: [RevealDirective],
  templateUrl: './model.html',
  styleUrl: './model.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelComponent {
  private readonly landing = inject(LandingService);

  readonly businessModel = this.landing.businessModel;
  readonly flow = this.landing.businessFlow;

  /** Párrafos del modelo de negocio. */
  readonly businessBody = computed<string[]>(
    () => this.landing.businessModel()?.body ?? [],
  );
}
