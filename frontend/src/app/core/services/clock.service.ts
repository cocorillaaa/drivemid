import { Injectable, DestroyRef, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';

/**
 * Reloj compartido de la aplicación.
 *
 * Expone la hora actual como Signal y la actualiza cada segundo, de modo que
 * los textos relativos ("hace 42 min", "hace 12 s") se refrescan solos sin
 * necesidad de recargar datos.
 */
@Injectable({ providedIn: 'root' })
export class ClockService {
  private readonly _now = signal(Date.now());

  /** Marca de tiempo actual (ms). Se actualiza cada segundo. */
  readonly now = this._now.asReadonly();

  constructor() {
    const timer = setInterval(() => this._now.set(Date.now()), environment.clockTickMs);

    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
