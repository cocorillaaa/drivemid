import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ClipboardService } from '../../../../core/services/clipboard.service';
import { LandingService } from '../../../../core/services/landing.service';

/** Pie de página del sitio público. */
@Component({
  selector: 'dl-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  private readonly landing = inject(LandingService);
  private readonly clipboard = inject(ClipboardService);

  /** Año mostrado en el aviso legal. */
  readonly year = new Date().getFullYear();

  /** Nombre de la marca (servido por la API). */
  readonly brandName = computed(() => this.landing.brand()?.name ?? 'Drive Mid');

  /** Identidad legal mostrada en el aviso de pie. */
  readonly brandLegal = computed(
    () => this.landing.brand()?.legalName ?? 'Drive Mid',
  );

  /** Canales de contacto institucionales (servidos por la API). */
  readonly contact = this.landing.contact;

  /** Copia un dato de contacto al portapapeles. */
  copy(value: string | undefined, label: string): void {
    this.clipboard.copy(value ?? '', label);
  }

  /** Enlaces a las secciones del programa. */
  readonly program = [
    { label: 'Quiénes somos', href: '#nosotros' },
    { label: 'Modelo de negocio', href: '#programa' },
    { label: 'Plan de trabajo', href: '#plan' },
    { label: 'A quién se dirige', href: '#participa' },
  ];

  /** Enlaces de participación y acceso. */
  readonly platform = [
    { label: 'Acceso a la plataforma', href: '/acceso' },
    { label: 'Quiero invertir', href: '#contacto' },
    { label: 'Quiero conducir', href: '#contacto' },
  ];
}
