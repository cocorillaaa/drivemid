import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import { ToastService } from '../../../core/services/toast.service';

/**
 * Contenedor global de notificaciones.
 *
 * Se suscribe a `ToastService` y pinta las alertas no bloqueantes que
 * confirman las acciones de la demo (altas de formularios, actualizaciones
 * de unidad, degradación a modo mock, etc.).
 */
@Component({
  selector: 'dl-toast-host',
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);

  /** Notificaciones activas. */
  readonly toasts = this.toastService.toasts;

  /** Cierra una notificación concreta. */
  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
