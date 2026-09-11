<?php

namespace App\Services;

use App\Models\UnitPeriod;
use App\Models\Vehicle;
use Illuminate\Support\Collection;

/**
 * Indicadores de rendimiento de una unidad.
 *
 * Traduce los cortes semanales de `unit_periods` a los ocho indicadores que
 * pide el estudio de mercado del cliente. El cálculo vive aquí, en un solo
 * lugar, y no en las vistas ni en los controladores.
 *
 * Convenciones que conviene tener presentes al leer los números:
 *
 * - El **ingreso** de un periodo sale del corte, no de una fórmula: en este
 *   negocio es la renta pactada que el conductor paga por la unidad, y el
 *   combustible corre por su cuenta.
 * - Los **costos fijos** (seguro, monitoreo, administración) se declaran por
 *   mes en el contrato de la unidad y aquí se prorratean por día: un periodo
 *   puede tener menos de siete días y no se le puede cargar el mes completo.
 * - La **utilización** se mide contra el kilometraje semanal de referencia y
 *   también contra los días disponibles, porque una unidad puede rodar mucho
 *   en pocos días.
 * - La **reserva** se aparta del ingreso de cada periodo; no es un gasto, es
 *   dinero que deja de estar disponible para distribuir.
 */
class UnitPerformanceCalculator
{
    /** Días que se consideran en un periodo completo. */
    private const DAYS_PER_PERIOD = 7;

    /** Días promedio de un mes, para prorratear los costos fijos. */
    private const DAYS_PER_MONTH = 30.44;

    /**
     * Rendimiento de una unidad en una ventana de semanas.
     *
     * @param  Collection<int, UnitPeriod>  $periods
     * @return array<string, mixed>
     */
    public function forVehicle(Vehicle $vehicle, Collection $periods): array
    {
        $weeks = $periods->count();

        if ($weeks === 0) {
            return $this->emptyResult($vehicle);
        }

        $km = (int) $periods->sum('km_driven');
        $daysAvailable = (int) $periods->sum(fn (UnitPeriod $p): int => $p->availableDays());
        $daysInService = (int) $periods->sum('days_in_service');
        $daysInShop = (int) $periods->sum('days_in_shop');

        $grossIncome = (int) $periods->sum('gross_income');
        $collectedIncome = (int) $periods->sum('collected_income');
        $outstanding = max(0, $grossIncome - $collectedIncome);

        $maintenanceCost = (int) $periods->sum('maintenance_cost');
        $incidentCost = (int) $periods->sum('incident_cost');
        $directCosts = (int) $periods->sum(fn (UnitPeriod $p): int => $p->directCosts());

        // Los costos fijos se declaran por mes y se cargan por día de operación.
        $fixedCosts = (int) round($vehicle->monthlyFixedCosts() / self::DAYS_PER_MONTH * $daysAvailable);

        $operatingResult = $grossIncome - $directCosts - $fixedCosts;
        $reserve = (int) $periods->sum(fn (UnitPeriod $p): int => $this->reserveFor($vehicle, $p));
        $netFlow = $operatingResult - $reserve;

        $drivers = $periods->pluck('driver_name')->filter()->unique();

        return [
            'weeks' => $weeks,
            'first_week' => $periods->min('week_start')?->toDateString(),
            'last_week' => $periods->max('week_start')?->toDateString(),

            // Capital y condiciones del contrato.
            'capital_invested' => $vehicle->capital_invested,
            'weekly_fee' => $vehicle->weekly_fee,
            'acquired_on' => $vehicle->acquired_on?->toDateString(),
            'financials_are_demo' => (bool) $vehicle->financials_are_demo,

            // Operación.
            'km' => $km,
            'days_available' => $daysAvailable,
            'days_in_service' => $daysInService,
            'days_in_shop' => $daysInShop,
            'days_off_road' => max(0, $daysAvailable - $daysInService),

            // Dinero.
            'gross_income' => $grossIncome,
            'collected_income' => $collectedIncome,
            'outstanding_income' => $outstanding,
            'maintenance_cost' => $maintenanceCost,
            'incident_cost' => $incidentCost,
            'direct_costs' => $directCosts,
            'fixed_costs' => $fixedCosts,
            'operating_result' => $operatingResult,
            'reserve' => $reserve,
            'net_flow' => $netFlow,
            'monthly_net_flow' => $this->monthly($netFlow, $weeks),

            // Indicadores del estudio.
            'utilization_pct' => $this->ratio($km, $vehicle->targetWeeklyKm() * $weeks),
            'availability_pct' => $this->ratio($daysInService, $daysAvailable),
            'gross_income_per_day' => $this->perDay($grossIncome, $daysInService),
            'net_flow_per_day' => $this->perDay($netFlow, $daysInService),
            'net_flow_per_km' => $km > 0 ? round($netFlow / $km, 2) : 0.0,
            'cost_per_km' => $km > 0 ? round(($directCosts + $fixedCosts) / $km, 2) : 0.0,
            'maintenance_cost_per_km' => $km > 0 ? round($maintenanceCost / $km, 2) : 0.0,
            'monthly_km' => $weeks > 0 ? (int) round($km / $weeks * (self::DAYS_PER_MONTH / self::DAYS_PER_PERIOD)) : 0,
            'delinquency_pct' => $this->ratio($outstanding, $grossIncome),
            'driver_turnover' => max(0, $drivers->count() - 1),
            'driver_names' => $drivers->values()->all(),

            // Retorno sobre el capital invertido, anualizado.
            'annualized_return_pct' => $this->annualizedReturn($netFlow, $weeks, $vehicle->capital_invested),

            // Serie para las gráficas.
            'series' => $this->series($periods, $vehicle),
        ];
    }

    /**
     * Rendimiento agregado del programa, a partir del de cada unidad.
     *
     * @param  Collection<int, array<string, mixed>>  $perUnit
     * @return array<string, mixed>
     */
    public function forProgram(Collection $perUnit): array
    {
        $withData = $perUnit->filter(fn (array $unit): bool => $unit['weeks'] > 0);

        if ($withData->isEmpty()) {
            return [
                'units_with_data' => 0,
                'capital_invested' => (int) $perUnit->sum('capital_invested'),
                'net_flow' => 0,
                'operating_result' => 0,
                'gross_income' => 0,
                'outstanding_income' => 0,
                'monthly_net_flow' => 0,
                'annualized_return_pct' => 0.0,
                'weighted_utilization_pct' => 0.0,
                'weighted_availability_pct' => 0.0,
                'delinquency_pct' => 0.0,
                'cost_per_km' => 0.0,
            ];
        }

        $grossIncome = (int) $withData->sum('gross_income');
        $netFlow = (int) $withData->sum('net_flow');
        $capital = (int) $withData->sum('capital_invested');
        $km = (int) $withData->sum('km');
        $weeks = (int) $withData->sum('weeks');

        $daysAvailable = (int) $withData->sum('days_available');
        $daysInService = (int) $withData->sum('days_in_service');

        return [
            'units_with_data' => $withData->count(),
            'capital_invested' => $capital,
            'gross_income' => $grossIncome,
            'outstanding_income' => (int) $withData->sum('outstanding_income'),
            'operating_result' => (int) $withData->sum('operating_result'),
            'net_flow' => $netFlow,
            'monthly_net_flow' => $this->monthly($netFlow, $weeks),
            'annualized_return_pct' => $this->annualizedReturn($netFlow, $weeks, $capital),

            /*
             * Los promedios se ponderan por volumen, no por unidad: una unidad
             * que rodó 700 km no puede pesar lo mismo que una parada en taller.
             */
            'weighted_utilization_pct' => $this->ratio($km, Vehicle::TARGET_WEEKLY_KM * $weeks),
            'weighted_availability_pct' => $this->ratio($daysInService, $daysAvailable),
            'delinquency_pct' => $this->ratio((int) $withData->sum('outstanding_income'), $grossIncome),
            'cost_per_km' => $km > 0
                ? round(((int) $withData->sum('direct_costs') + (int) $withData->sum('fixed_costs')) / $km, 2)
                : 0.0,
        ];
    }

    /**
     * Serie semanal para las gráficas: km, flujo neto y utilización.
     *
     * @param  Collection<int, UnitPeriod>  $periods
     * @return list<array<string, mixed>>
     */
    private function series(Collection $periods, Vehicle $vehicle): array
    {
        return $periods
            ->sortBy('week_start')
            ->values()
            ->map(function (UnitPeriod $period) use ($vehicle): array {
                $directCosts = $period->directCosts();
                $fixedCosts = (int) round(
                    $vehicle->monthlyFixedCosts() / self::DAYS_PER_MONTH * $period->availableDays(),
                );
                $reserve = $this->reserveFor($vehicle, $period);

                return [
                    'week_start' => $period->week_start->toDateString(),
                    'km' => $period->km_driven,
                    'gross_income' => $period->gross_income,
                    'net_flow' => $period->gross_income - $directCosts - $fixedCosts - $reserve,
                    'utilization_pct' => $this->ratio($period->km_driven, $vehicle->targetWeeklyKm()),
                    'days_in_shop' => $period->days_in_shop,
                ];
            })
            ->all();
    }

    /** Reserva que se aparta del ingreso de un periodo. */
    private function reserveFor(Vehicle $vehicle, UnitPeriod $period): int
    {
        return (int) round($vehicle->maintenance_reserve / self::DAYS_PER_PERIOD * $period->availableDays());
    }

    /**
     * Retorno anualizado sobre el capital invertido.
     *
     * Es una proyección lineal del flujo observado, no una promesa: el estudio
     * del cliente insiste en no presentar rendimientos garantizados.
     */
    private function annualizedReturn(int $netFlow, int $weeks, int $capital): float
    {
        if ($capital <= 0 || $weeks <= 0) {
            return 0.0;
        }

        $weeksPerYear = 365 / self::DAYS_PER_PERIOD;
        $annualFlow = $netFlow / $weeks * $weeksPerYear;

        return round($annualFlow / $capital * 100, 1);
    }

    /** Lleva un importe de la ventana observada a un mes promedio. */
    private function monthly(int $amount, int $weeks): int
    {
        if ($weeks <= 0) {
            return 0;
        }

        return (int) round($amount / $weeks * (self::DAYS_PER_MONTH / self::DAYS_PER_PERIOD));
    }

    /** Porcentaje redondeado, seguro ante un denominador en cero. */
    private function ratio(int $part, int $total): float
    {
        return $total > 0 ? round($part / $total * 100, 1) : 0.0;
    }

    /** Promedio diario redondeado, seguro ante un denominador en cero. */
    private function perDay(int $amount, int $days): int
    {
        return $days > 0 ? (int) round($amount / $days) : 0;
    }

    /**
     * Resultado de una unidad sin cortes capturados.
     *
     * Se devuelve la misma estructura con todo en cero: la vista distingue
     * "sin datos" de "con datos en cero" por el número de semanas.
     *
     * @return array<string, mixed>
     */
    private function emptyResult(Vehicle $vehicle): array
    {
        return [
            'weeks' => 0,
            'first_week' => null,
            'last_week' => null,
            'capital_invested' => $vehicle->capital_invested,
            'weekly_fee' => $vehicle->weekly_fee,
            'acquired_on' => $vehicle->acquired_on?->toDateString(),
            'financials_are_demo' => (bool) $vehicle->financials_are_demo,
            'km' => 0,
            'days_available' => 0,
            'days_in_service' => 0,
            'days_in_shop' => 0,
            'days_off_road' => 0,
            'gross_income' => 0,
            'collected_income' => 0,
            'outstanding_income' => 0,
            'maintenance_cost' => 0,
            'incident_cost' => 0,
            'direct_costs' => 0,
            'fixed_costs' => 0,
            'operating_result' => 0,
            'reserve' => 0,
            'net_flow' => 0,
            'monthly_net_flow' => 0,
            'utilization_pct' => 0.0,
            'availability_pct' => 0.0,
            'gross_income_per_day' => 0,
            'net_flow_per_day' => 0,
            'net_flow_per_km' => 0.0,
            'cost_per_km' => 0.0,
            'maintenance_cost_per_km' => 0.0,
            'monthly_km' => 0,
            'delinquency_pct' => 0.0,
            'driver_turnover' => 0,
            'driver_names' => [],
            'annualized_return_pct' => 0.0,
            'series' => [],
        ];
    }
}
