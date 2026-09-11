import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LandingService } from '../../../../core/services/landing.service';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

/**
 * Plan de trabajo: las etapas que el cliente pidió ver en el front.
 *
 * Cada etapa llega numerada desde el backend, de modo que el orden y los
 * textos se ajustan sin recompilar el frontend.
 */
@Component({
  selector: 'dl-work-plan',
  imports: [RevealDirective],
  templateUrl: './work-plan.html',
  styleUrl: './work-plan.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkPlanComponent {
  private readonly landing = inject(LandingService);

  readonly workPlan = this.landing.workPlan;
  readonly steps = this.landing.workPlanSteps;
}
