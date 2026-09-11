import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { FleetApiService } from '../../../core/services/fleet-api.service';
import { FleetService } from '../../../core/services/fleet.service';
import { ToastService } from '../../../core/services/toast.service';
import { UnitPerformanceDetail } from '../../../core/models/fleet.models';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';

/**
 * Reporte de rendimiento de una unidad.
 *
 * Es el documento que se entrega a un inversionista: condiciones del
 * contrato, indicadores de la ventana observada, el recorrido del ingreso
 * hasta el flujo y la bitácora de cortes semanales que respalda cada número.
 * Se imprime tal cual, para guardarlo en PDF.
 */
@Component({
  selector: 'dl-performance-report',
  imports: [RouterLink, StatCardComponent],
  templateUrl: './performance-report.html',
  styleUrl: './performance-report.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceReport {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(FleetApiService);
  private readonly fleet = inject(FleetService);
  private readonly toast = inject(ToastService);

  readonly detail = signal<UnitPerformanceDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Ventana observada del reporte. */
  readonly weeks = this.fleet.performanceWeeks;

  /** Fecha de emisión impresa en el documento. */
  readonly issuedOn = new Date();

  /** Condiciones económicas pactadas, en el orden en que se leen. */
  readonly terms = computed(() => {
    const performance = this.detail()?.performance;
    if (!performance) return [];

    return [
      { label: 'Capital invertido', value: this.money(performance.capitalInvested) },
      { label: 'Renta semanal pactada', value: this.money(performance.weeklyFee) },
      { label: 'Reserva por semana', value: this.money(performance.reserve / Math.max(performance.weeks, 1)) },
      { label: 'Alta del activo', value: this.date(performance.acquiredOn) },
    ];
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    this.api
      .getUnitPerformance(id, this.weeks())
      .pipe(
        tap((detail) => {
          this.detail.set(detail);
          this.error.set(null);
        }),
        catchError(() => {
          this.error.set('No fue posible cargar el reporte de esta unidad.');
          return of(null);
        }),
      )
      .subscribe(() => this.loading.set(false));
  }

  /** Abre el diálogo de impresión del navegador para guardar en PDF. */
  print(): void {
    globalThis.print?.();
  }

  /** Descarga la bitácora de cortes en CSV. */
  exportCsv(): void {
    const detail = this.detail();
    if (!detail) return;

    const header = [
      'Semana',
      'Km',
      'Días en servicio',
      'Días en taller',
      'Ingreso',
      'Cobrado',
      'Pendiente',
      'Costos directos',
      'Conductor',
      'Origen',
    ];

    const lines = detail.periods.map((period) =>
      [
        period.weekStart,
        period.kmDriven,
        period.daysInService,
        period.daysInShop,
        period.grossIncome,
        period.collectedIncome,
        period.outstandingIncome,
        period.directCosts,
        period.driverName ?? '',
        period.source,
      ]
        .map((cell) => csvCell(String(cell)))
        .join(','),
    );

    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drivemid-rendimiento-${detail.vehicle.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.toast.success('Bitácora exportada', 'Se descargó el CSV con los cortes semanales.');
  }

  /** Formatea un importe en pesos, con signo y sin decimales. */
  money(value: number): string {
    const sign = value < 0 ? '−' : '';
    return `${sign}$${Math.abs(Math.round(value)).toLocaleString('es-MX')}`;
  }

  /** Formatea una fecha ISO corta. */
  date(value: string | null): string {
    if (!value) return '—';
    const [year, month, day] = value.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }
}

/** Escapa una celda CSV. */
function csvCell(value: string): string {
  const text = String(value ?? '');
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
