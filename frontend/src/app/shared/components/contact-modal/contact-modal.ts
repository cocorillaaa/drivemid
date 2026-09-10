import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { ClipboardService } from '../../../core/services/clipboard.service';
import { formatPhone } from '../../../core/utils/fleet-format';

/** Persona o canal con el que se puede contactar. */
export interface ContactTarget {
  /** Nombre completo o nombre del canal. */
  name: string;
  /** Función dentro de la operación, p. ej. "Conductor asignado". */
  role: string;
  /** Contexto de la unidad, p. ej. "Unidad 04 · KLM-012". */
  context?: string;
  /** Teléfono a 10 dígitos. */
  phone?: string;
  /** Correo electrónico. */
  email?: string;
}

/**
 * Ficha de contacto en ventana modal.
 *
 * Sustituye a los enlaces `tel:` y `mailto:`, que provocan el aviso nativo
 * del navegador para abrir una aplicación externa. Aquí el dato se muestra y
 * se copia al portapapeles, con el mismo lenguaje visual que el resto de la
 * plataforma.
 */
@Component({
  selector: 'dl-contact-modal',
  templateUrl: './contact-modal.html',
  styleUrl: './contact-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactModalComponent {
  private readonly clipboard = inject(ClipboardService);

  /** Datos de contacto a mostrar. */
  readonly contact = input.required<ContactTarget>();

  /** Se emite al cerrar la ventana. */
  readonly closed = output<void>();

  /** Teléfono formateado para lectura. */
  readonly phoneDisplay = computed(() => {
    const phone = this.contact().phone;
    return phone ? formatPhone(phone) : '';
  });

  /** Teléfono en formato internacional, listo para pegar. */
  readonly phoneValue = computed(() => {
    const phone = this.contact().phone;
    return phone ? `+52 ${formatPhone(phone)}` : '';
  });

  /** Copia el teléfono al portapapeles. */
  copyPhone(): void {
    this.clipboard.copy(this.phoneValue(), 'Teléfono');
  }

  /** Copia el correo al portapapeles. */
  copyEmail(): void {
    this.clipboard.copy(this.contact().email ?? '', 'Correo');
  }

  /** Cierra la ventana modal. */
  close(): void {
    this.closed.emit();
  }

  /** Cierra con la tecla Escape. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
