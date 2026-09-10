<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateVehicleTelemetryRequest;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Endpoints de consulta y actualización de las unidades de la flota.
 */
class VehicleController extends Controller
{
    /**
     * Listado completo de la flota ordenado por código de unidad.
     */
    public function index(): AnonymousResourceCollection
    {
        $vehicles = Vehicle::query()->orderBy('unit_code')->get();

        return VehicleResource::collection($vehicles);
    }

    /**
     * Detalle de una unidad (route model binding por `id`).
     */
    public function show(Vehicle $vehicle): VehicleResource
    {
        return new VehicleResource($vehicle);
    }

    /**
     * Métricas agregadas de la flota para el dashboard de Superusuario.
     */
    public function summary(): JsonResponse
    {
        $totalUnits = Vehicle::count();
        $expiredPolicies = Vehicle::query()->whereDate('policy_valid_to', '<', today())->count();
        $expiringPolicies = Vehicle::query()
            ->whereDate('policy_valid_to', '>=', today())
            ->whereDate('policy_valid_to', '<=', today()->addDays(Vehicle::POLICY_WARNING_DAYS))
            ->count();

        $totalWeeklyKm = (int) Vehicle::query()->sum('weekly_km');

        return response()->json([
            'data' => [
                'total_units' => $totalUnits,
                'active_units' => Vehicle::query()->active()->count(),
                'on_service_units' => Vehicle::query()->where('status', 'en_servicio')->count(),
                'available_units' => Vehicle::query()->where('status', 'disponible')->count(),
                'total_weekly_km' => $totalWeeklyKm,
                'average_weekly_km' => $totalUnits > 0 ? (int) round($totalWeeklyKm / $totalUnits) : 0,
                'policy_alerts' => $expiredPolicies + $expiringPolicies,
                'expired_policies' => $expiredPolicies,
                'expiring_policies' => $expiringPolicies,
                'insurance_coverage_pct' => $totalUnits > 0
                    ? (int) round((($totalUnits - $expiredPolicies) / $totalUnits) * 100)
                    : 0,
                'last_telemetry_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Actualiza kilometraje semanal y/o teléfono de contacto del conductor.
     */
    public function updateTelemetry(UpdateVehicleTelemetryRequest $request, Vehicle $vehicle): JsonResponse
    {
        $validated = $request->validated();

        if (array_key_exists('weekly_km', $validated)) {
            $vehicle->weekly_km = (int) $validated['weekly_km'];
            $vehicle->weekly_km_by_day = $this->redistributeWeekly(
                $vehicle->weekly_km_by_day ?? [],
                $vehicle->weekly_km,
            );
        }

        if (array_key_exists('driver_phone', $validated)) {
            $vehicle->driver_phone = $validated['driver_phone'];
        }

        $vehicle->save();

        return (new VehicleResource($vehicle))
            ->additional(['message' => 'Telemetría de la unidad actualizada correctamente.'])
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Reparte un total semanal entre los 7 días conservando la forma de la
     * serie original, para que las gráficas sigan siendo coherentes.
     *
     * @param  array<int, int|float>  $series
     * @return array<int, int>
     */
    private function redistributeWeekly(array $series, int $total): array
    {
        $base = count($series) === 7 ? array_map('floatval', $series) : array_fill(0, 7, 1.0);
        $weightSum = array_sum($base) ?: 7.0;

        $scaled = array_map(
            static fn (float $day): int => (int) round(($day / $weightSum) * $total),
            $base,
        );

        $drift = $total - array_sum($scaled);
        $lastIndex = count($scaled) - 1;
        $scaled[$lastIndex] = max(0, $scaled[$lastIndex] + $drift);

        return array_values($scaled);
    }
}
