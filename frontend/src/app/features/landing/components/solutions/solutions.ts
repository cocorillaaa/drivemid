import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LandingService } from '../../../../core/services/landing.service';

/**
 * Sección de soluciones: las líneas de servicio ejecutivo que ofrece
 * DemoLogistics. El catálogo proviene del backend.
 */
@Component({
  selector: 'dl-solutions',
  templateUrl: './solutions.html',
  styleUrl: './solutions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionsComponent {
  private readonly landing = inject(LandingService);

  /** Catálogo de soluciones publicado por la API. */
  readonly solutions = this.landing.solutions;

  /** `true` mientras el contenido se carga. */
  readonly loading = this.landing.loading;
}
