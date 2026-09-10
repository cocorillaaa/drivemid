import { Directive, ElementRef, OnDestroy, OnInit, inject, input, signal } from '@angular/core';

/** Variantes de entrada disponibles. */
export type RevealVariant = 'up' | 'fade' | 'left' | 'right' | 'zoom';

/**
 * Animación de entrada al hacer scroll.
 *
 * Replica el comportamiento de los sitios Wix (como uride.mx): un
 * `IntersectionObserver` añade la clase `is-visible` cuando el elemento entra
 * en el viewport y el CSS se encarga del movimiento.
 *
 * Uso:
 * ```html
 * <div [dlReveal]="'up'" [dlRevealDelay]="120">…</div>
 * ```
 * Si el sistema operativo pide movimiento reducido, el elemento se muestra
 * de inmediato sin animación.
 */
@Directive({
  selector: '[dlReveal]',
  host: {
    '[class.dl-reveal]': 'true',
    '[class.is-visible]': 'visible()',
    '[attr.data-reveal]': 'dlReveal()',
    '[style.--dl-reveal-delay.ms]': 'dlRevealDelay()',
  },
})
export class RevealDirective implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Variante de entrada. */
  readonly dlReveal = input<RevealVariant>('up');

  /** Retardo en milisegundos, para escalonar tarjetas. */
  readonly dlRevealDelay = input<number>(0);

  /**
   * `true` cuando el elemento ya entró en pantalla.
   *
   * Es un signal a propósito: la aplicación funciona sin zone.js, así que
   * una propiedad normal no dispararía la detección de cambios al recibir la
   * notificación del IntersectionObserver.
   */
  protected readonly visible = signal(false);

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const element = this.host.nativeElement as HTMLElement;

    // Sin soporte o con movimiento reducido: se muestra sin animar.
    if (
      typeof IntersectionObserver === 'undefined' ||
      globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      this.visible.set(true);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          this.visible.set(true);
          this.observer?.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
