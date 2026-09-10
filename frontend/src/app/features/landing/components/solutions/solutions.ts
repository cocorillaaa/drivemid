import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SERVICE_SOLUTIONS } from '../../../../core/data/fleet-mock.data';

/**
 * Sección de soluciones: las cuatro líneas de servicio ejecutivo
 * que ofrece Vanguard Fleet a clientes corporativos.
 */
@Component({
  selector: 'vf-solutions',
  templateUrl: './solutions.html',
  styleUrl: './solutions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionsComponent {
  /** Catálogo de soluciones mostradas. */
  readonly solutions = SERVICE_SOLUTIONS;
}
