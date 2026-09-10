import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Tarjeta ejecutiva de métrica (KPI).
 *
 * Presenta un indicador con etiqueta, valor, unidad y una pista contextual.
 * No usa iconografía: la jerarquía se resuelve con tipografía y la variante
 * `accent`, que invierte la tarjeta principal del panel.
 */
@Component({
  selector: 'vf-stat-card',
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  /** Etiqueta descriptiva del indicador. */
  readonly label = input.required<string>();

  /** Valor principal (ya formateado). */
  readonly value = input.required<string | number>();

  /** Sufijo del valor, p. ej. "km" o "%". */
  readonly unit = input<string>('');

  /** Texto de apoyo bajo el valor. */
  readonly hint = input<string>('');

  /** Estilo invertido (fondo negro) para el KPI principal. */
  readonly accent = input<boolean>(false);
}
