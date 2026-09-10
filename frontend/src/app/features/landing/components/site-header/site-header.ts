import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { LandingService } from '../../../../core/services/landing.service';

interface NavLink {
  label: string;
  href: string;
}

/**
 * Encabezado minimalista de la landing pública.
 *
 * Se mantiene fijo sobre el hero oscuro y gana un fondo translúcido al hacer
 * scroll. El acceso a la plataforma lleva a la pantalla de credenciales.
 */
@Component({
  selector: 'dl-site-header',
  imports: [RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent implements OnInit, OnDestroy {
  private readonly landing = inject(LandingService);

  /** Canales de contacto institucionales (servidos por la API). */
  readonly contact = this.landing.contact;

  /** Enlaces de navegación por ancla. */
  readonly navLinks: readonly NavLink[] = [
    { label: 'Soluciones', href: '#soluciones' },
    { label: 'Cobertura', href: '#cobertura' },
    { label: 'Contacto', href: '#contacto' },
  ];

  /** `true` cuando la página se ha desplazado más de 12 px. */
  readonly scrolled = signal(false);

  /** `true` cuando el menú móvil está desplegado. */
  readonly menuOpen = signal(false);

  private readonly onScroll = (): void => {
    const next = globalThis.scrollY > 12;
    if (next !== this.scrolled()) this.scrolled.set(next);
  };

  ngOnInit(): void {
    this.onScroll();
    globalThis.addEventListener?.('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    globalThis.removeEventListener?.('scroll', this.onScroll);
  }

  /** Alterna el menú móvil. */
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** Cierra el menú móvil tras navegar. */
  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
