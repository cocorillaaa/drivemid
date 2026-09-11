import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { ClipboardService } from '../../../../core/services/clipboard.service';
import { LandingService } from '../../../../core/services/landing.service';

interface NavLink {
  label: string;
  href: string;
}

/**
 * Encabezado del sitio público.
 *
 * Barra sólida sobre fondo claro: la marca del cliente ya trae el nombre en
 * el propio distintivo, así que no se repite como texto. El acceso a la
 * plataforma lleva a la pantalla de credenciales.
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
  private readonly clipboard = inject(ClipboardService);

  /** Nombre de la marca (servido por la API). */
  readonly brandName = computed(() => this.landing.brand()?.name ?? 'Drive Mid');

  /** Distintivo de maqueta. */
  readonly demoBadge = computed(() => this.landing.brand()?.demoBadge ?? 'Demo');

  /** Canales de contacto institucionales (servidos por la API). */
  readonly contact = this.landing.contact;

  /** Enlaces de navegación por ancla. */
  readonly navLinks: readonly NavLink[] = [
    { label: 'Quiénes somos', href: '#nosotros' },
    { label: 'Programa', href: '#programa' },
    { label: 'Plan de trabajo', href: '#plan' },
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

  /** Copia el teléfono de atención. */
  copyPhone(): void {
    this.clipboard.copy(this.contact()?.phone ?? '', 'Teléfono');
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
