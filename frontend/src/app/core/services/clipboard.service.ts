import { Injectable, inject } from '@angular/core';

import { ToastService } from './toast.service';

/**
 * Copia valores al portapapeles con confirmación visual.
 *
 * Se usa en lugar de enlaces `tel:` y `mailto:`: esos esquemas hacen que el
 * navegador muestre su propio diálogo de "abrir aplicación externa", que no
 * se puede estilizar ni suprimir. Copiar el dato mantiene la interacción
 * dentro del sistema.
 */
@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private readonly toast = inject(ToastService);

  /**
   * Copia `value` y notifica el resultado.
   *
   * @param value  texto a copiar.
   * @param label  nombre del dato, p. ej. "Teléfono".
   */
  copy(value: string, label: string): void {
    const text = String(value ?? '').trim();

    if (!text) {
      this.toast.warning(`Sin ${label.toLowerCase()}`, 'No hay un dato disponible para copiar.');
      return;
    }

    const clipboard = globalThis.navigator?.clipboard;

    if (!clipboard) {
      // Sin API de portapapeles (contexto no seguro) se muestra el dato.
      this.toast.info(label, text);
      return;
    }

    void clipboard.writeText(text).then(
      () => this.toast.success(`${label} copiado`, text),
      () => this.toast.info(label, text),
    );
  }
}
