import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FleetService } from '../../../core/services/fleet.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';

/** Línea del recorrido del ingreso hasta el flujo neto. */
interface WaterfallLine {
  label: string;
  amount: number;
  /** Ancho relativo de la barra, sobre la línea de mayor importe. */
  width: number;
  kind: 'income' | 'cost' | 'total';
  total: boolean;
}

/** Ventanas de observación ofrecidas al usuario. */
interface WindowOption {
  weeks: number;
  label: string;
}

/**
 * Panel de rendimiento del programa.
 *
 * Es la lectura del inversionista: cuánto produce el capital, cuánto se queda
 * en reserva y cuánto llega al flujo. Se separa a propósito del panel
 * operativo, que responde otra pregunta: dónde está cada unidad y cómo va.
 */
@Component({
  selector: 'dl-performance-panel',
  imports: [RouterLink, StatCardComponent],
  templateUrl: './performance-panel.html',
  styleUrl: './performance-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformancePanelComponent {
  private readonly fleet = inject(FleetService);

  /** Kilometraje semanal de referencia del programa. */
  readonly referenceKm = 412;

  /** Ventanas disponibles. */
  readonly windows: readonly WindowOption[] = [
    { weeks: 4, label: 'Mes' },
    { weeks: 12, label: 'Trimestre' },
    { weeks: 26, label: 'Semestre' },
  ];

  readonly performance = this.fleet.performance;
  readonly performanceError = this.fleet.performanceError;
  readonly loading = this.fleet.performanceLoading;
  readonly weeks = this.fleet.performanceWeeks;

  /** Serie semanal de toda la flota, de la semana más antigua a la más reciente. */
  readonly programSeries = computed(() => {
    const units = this.performance()?.units ?? [];
    const byWeek = new Map<string, number>();

    for (const unit of units) {
      for (const point of unit.series) {
        byWeek.set(point.weekStart, (byWeek.get(point.weekStart) ?? 0) + point.netFlow);
      }
    }

    return [...byWeek.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, netFlow]) => ({ weekStart, netFlow }));
  });

  /** Días fuera de servicio acumulados en la ventana. */
  readonly daysOffRoad = computed(() =>
    (this.performance()?.units ?? []).reduce((total, unit) => total + unit.daysOffRoad, 0),
  );

  /**
   * Recorrido del ingreso hasta el flujo neto.
   *
   * Se muestra como cascada porque el flujo solo no explica nada: el
   * inversionista necesita ver cuánto se fue en costos y cuánto quedó en
   * reserva antes de llegar al número final.
   */
  readonly waterfall = computed<WaterfallLine[]>(() => {
    const program = this.performance()?.program;
    if (!program) return [];

    const gross = program.grossIncome;
    const costs = gross - program.operatingResult;
    const reserve = program.operatingResult - program.netFlow;

    const lines = [
      { label: 'Ingreso facturado', amount: gross, kind: 'income' as const, total: false },
      { label: 'Costos directos y fijos', amount: -costs, kind: 'cost' as const, total: false },
      { label: 'Reserva de mantenimiento', amount: -reserve, kind: 'cost' as const, total: false },
      { label: 'Flujo neto del periodo', amount: program.netFlow, kind: 'total' as const, total: true },
    ];

    const scale = Math.max(...lines.map((line) => Math.abs(line.amount)), 1);

    return lines.map((line) => ({
      ...line,
      width: Math.round((Math.abs(line.amount) / scale) * 100),
    }));
  });

  /** Cambia la ventana observada y recarga los indicadores. */
  selectWindow(weeks: number): void {
    this.fleet.setPerformanceWeeks(weeks);
  }

  /** Vuelve a pedir los indicadores con la ventana actual. */
  reload(): void {
    this.fleet.loadPerformance();
  }

  /** Altura relativa de una barra de la serie, sobre el mayor valor absoluto. */
  barHeight(value: number): number {
    const max = Math.max(...this.programSeries().map((point) => Math.abs(point.netFlow)), 1);
    return Math.max(Math.round((Math.abs(value) / max) * 100), 4);
  }

  /** Formatea un importe en pesos sin decimales. */
  money(value: number): string {
    const sign = value < 0 ? '−' : '';
    return `${sign}$${Math.abs(Math.round(value)).toLocaleString('es-MX')}`;
  }
}
