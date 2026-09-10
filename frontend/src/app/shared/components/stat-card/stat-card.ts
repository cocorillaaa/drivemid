import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatTone = 'default' | 'ok' | 'warn' | 'danger';

/**
 * Tarjeta ejecutiva de métrica (KPI).
 *
 * Presenta un indicador con etiqueta, valor, unidad y una pista contextual.
 * La variante `accent` se usa para el indicador principal del dashboard.
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

  /** Icono Bootstrap Icons. */
  readonly icon = input<string>('bi-graph-up-arrow');

  /** Estilo invertido (fondo negro) para el KPI principal. */
  readonly accent = input<boolean>(false);

  /** Tono del icono cuando no es `accent`. */
  readonly tone = input<StatTone>('default');
}
