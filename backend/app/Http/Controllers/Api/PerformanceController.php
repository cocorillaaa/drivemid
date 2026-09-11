<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UnitPeriod;
use App\Models\Vehicle;
use App\Services\UnitPerformanceCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

/**
 * Rendimiento económico del programa.
 *
 * Responde a la pregunta que un inversionista hace —cuánto produce el capital
 * y con qué riesgo—, no a la que responde el panel de flota, que es dónde está
 * cada unidad y cómo va su operación.
 *
 * Está reservado al Superusuario: con una sola unidad, el detalle económico
 * identifica de inmediato al conductor y su renta. Si más adelante un
 * inversionista necesita consultarlo, lo correcto es una cuenta con su propio
 * alcance y no reutilizar la del administrador de unidad.
 */
class PerformanceController extends Controller
{
    /** Ventana por omisión, en semanas: un trimestre. */
    private const DEFAULT_WEEKS = 12;

    /** Tope de la ventana, en semanas: un año. */
    private const MAX_WEEKS = 52;

    public function __construct(private readonly UnitPerformanceCalculator $calculator) {}

    /**
     * Rendimiento del programa completo y de cada unidad.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewFleetSummary', Vehicle::class);

        $weeks = $this->weeks($request);
        $vehicles = Vehicle::query()->orderBy('unit_code')->get();

        $perUnit = $vehicles->map(function (Vehicle $vehicle) use ($weeks): array {
            $periods = $this->window($vehicle, $weeks);

            return [
                'vehicle' => $vehicle,
                'periods' => $periods,
                'performance' => $this->calculator->forVehicle($vehicle, $periods),
            ];
        });

        return response()->json([
            'data' => [
                'weeks' => $weeks,
                'demo_data' => $perUnit->contains(fn (array $row): bool => $this->isDemo($row)),
                'program' => $this->calculator->forProgram($perUnit->pluck('performance')),
                'units' => $perUnit->map(fn (array $row): array => [
                    'id' => $row['vehicle']->id,
                    'unit_code' => $row['vehicle']->unit_code,
                    'make' => $row['vehicle']->make,
                    'model' => $row['vehicle']->model,
                    'year' => (int) $row['vehicle']->year,
                    'plates' => $row['vehicle']->plates,
                    'status' => $row['vehicle']->status,
                    'driver_name' => $row['vehicle']->driver_name,
                    'tracking_url' => $row['vehicle']->tracking_url,
                    'periods_are_demo' => $this->periodsAreDemo($row['periods']),
                    ...$row['performance'],
                ])->values(),
            ],
        ]);
    }

    /**
     * Rendimiento de una unidad, con su serie semanal.
     */
    public function show(Request $request, Vehicle $vehicle): JsonResponse
    {
        Gate::authorize('viewFleetSummary', Vehicle::class);

        $weeks = $this->weeks($request);
        $periods = $this->window($vehicle, $weeks);

        $demo = $this->isDemo(['vehicle' => $vehicle, 'periods' => $periods]);

        return response()->json([
            'data' => [
                'weeks' => $weeks,
                'demo_data' => $demo,
                'vehicle' => [
                    'id' => $vehicle->id,
                    'unit_code' => $vehicle->unit_code,
                    'make' => $vehicle->make,
                    'model' => $vehicle->model,
                    'year' => (int) $vehicle->year,
                    'plates' => $vehicle->plates,
                    'status' => $vehicle->status,
                    'driver_name' => $vehicle->driver_name,
                    'tracking_url' => $vehicle->tracking_url,
                    'periods_are_demo' => $this->periodsAreDemo($periods),
                ],
                'performance' => $this->calculator->forVehicle($vehicle, $periods),
                'periods' => $periods->map(fn (UnitPeriod $period): array => [
                    'week_start' => $period->week_start->toDateString(),
                    'km_driven' => $period->km_driven,
                    'days_in_service' => $period->days_in_service,
                    'days_in_shop' => $period->days_in_shop,
                    'gross_income' => $period->gross_income,
                    'collected_income' => $period->collected_income,
                    'outstanding_income' => $period->outstandingAmount(),
                    'direct_costs' => $period->directCosts(),
                    'driver_name' => $period->driver_name,
                    'source' => $period->source,
                ])->values(),
            ],
        ]);
    }

    /**
     * ¿Las cifras de esta unidad son de ejemplo?
     *
     * Basta con que lo sea una de las dos mitades: los importes del contrato o
     * los cortes capturados. El aviso en pantalla depende de esto, así que se
     * calcula sobre el dato, no sobre una suposición.
     *
     * @param  array{vehicle: Vehicle, periods: Collection<int, UnitPeriod>}  $row
     */
    private function isDemo(array $row): bool
    {
        return (bool) $row['vehicle']->financials_are_demo
            || $this->periodsAreDemo($row['periods']);
    }

    /**
     * @param  Collection<int, UnitPeriod>  $periods
     */
    private function periodsAreDemo(Collection $periods): bool
    {
        return $periods->contains(fn (UnitPeriod $period): bool => $period->source === UnitPeriod::SOURCE_DEMO);
    }

    /**
     * Ventana de semanas solicitada, acotada a un rango razonable.
     */
    private function weeks(Request $request): int
    {
        $validated = $request->validate([
            'weeks' => ['sometimes', 'integer', 'min:1', 'max:'.self::MAX_WEEKS],
        ]);

        return (int) ($validated['weeks'] ?? self::DEFAULT_WEEKS);
    }

    /**
     * Cortes de la unidad dentro de la ventana, del más reciente al más antiguo.
     *
     * @return Collection<int, UnitPeriod>
     */
    private function window(Vehicle $vehicle, int $weeks): Collection
    {
        return $vehicle->periods()
            ->limit($weeks)
            ->get()
            ->sortByDesc('week_start')
            ->values();
    }
}
