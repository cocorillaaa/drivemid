import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LandingService } from '../../../../core/services/landing.service';

/** Pie de página institucional de la landing pública. */
@Component({
  selector: 'dl-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  private readonly landing = inject(LandingService);

  /** Año mostrado en el aviso legal. */
  readonly year = new Date().getFullYear();

  /** Canales de contacto institucionales (servidos por la API). */
  readonly contact = this.landing.contact;

  /** Enlaces de la columna de soluciones, tomados del catálogo de la API. */
  readonly solutions = computed(() => this.landing.solutions().map((s) => s.title));

  /** Enlaces de la columna de plataforma. */
  readonly platform = [
    { label: 'Acceso a la plataforma', href: '/acceso' },
    { label: 'Solicitar servicio', href: '#contacto' },
    { label: 'Postularse como conductor', href: '#contacto' },
    { label: 'Cobertura', href: '#cobertura' },
  ];
}
