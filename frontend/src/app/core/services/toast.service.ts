import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'danger' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  variant: ToastVariant;
  title: string;
  body?: string;
}

/**
 * Servicio de notificaciones no bloqueantes.
 *
 * Mantiene la colección de toasts en un Signal para que el componente
 * `dl-toast-host` reaccione sin necesidad de zone.js.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  private sequence = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  /** Lista reactiva de notificaciones activas. */
  readonly toasts = this._toasts.asReadonly();

  /** Muestra un toast genérico. */
  show(
    variant: ToastVariant,
    title: string,
    body?: string,
    durationMs = 5200,
  ): number {
    const id = ++this.sequence;
    this._toasts.update((list) => [
      ...list,
      { id, variant, title, body },
    ]);

    if (durationMs > 0) {
      const timer = setTimeout(() => this.dismiss(id), durationMs);
      this.timers.set(id, timer);
    }
    return id;
  }

  /** Notificación de operación exitosa. */
  success(title: string, body?: string): number {
    return this.show('success', title, body);
  }

  /** Notificación de error. */
  error(title: string, body?: string): number {
    return this.show('danger', title, body, 6500);
  }

  /** Notificación informativa. */
  info(title: string, body?: string): number {
    return this.show('info', title, body);
  }

  /** Notificación de advertencia. */
  warning(title: string, body?: string): number {
    return this.show('warning', title, body, 6500);
  }

  /** Cierra una notificación por id. */
  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  /** Cierra todas las notificaciones. */
  clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this._toasts.set([]);
  }
}
