import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LandingService } from '../../../../core/services/landing.service';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface PurposeBlock {
  title: string;
  body: string;
}

/**
 * Quiénes somos, misión, visión y valores.
 *
 * El contenido lo redacta el cliente: aquí sólo se presenta. Nada de esta
 * sección habla de cobertura ni de ciudades.
 */
@Component({
  selector: 'dl-about',
  imports: [RevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly landing = inject(LandingService);

  readonly about = this.landing.about;
  readonly values = this.landing.values;

  /** Párrafos de "Quiénes somos". */
  readonly aboutBody = computed<string[]>(() => this.landing.about()?.body ?? []);

  /** Misión y visión, en ese orden. */
  readonly purpose = computed<PurposeBlock[]>(() => {
    const blocks: PurposeBlock[] = [];
    const mission = this.landing.mission();
    const vision = this.landing.vision();

    if (mission) blocks.push(mission);
    if (vision) blocks.push(vision);

    return blocks;
  });
}
