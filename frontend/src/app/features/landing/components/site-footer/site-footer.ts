import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Pie de página institucional de la landing pública. */
@Component({
  selector: 'vf-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  /** Año mostrado en el aviso legal. */
  readonly year = new Date().getFullYear();

  /** Enlaces de la columna de soluciones. */
  readonly solutions = [
    'Transporte corporativo',
    'Traslado ejecutivo',
    'Gestión integral de flota',
    'Grupos y eventos',
  ];

  /** Enlaces de la columna de plataforma. */
  readonly platform = [
    { label: 'Panel de flota', href: '/plataforma' },
    { label: 'Mi unidad', href: '/plataforma' },
    { label: 'Solicitar servicio', href: '#contacto' },
    { label: 'Postularse como conductor', href: '#contacto' },
  ];
}
