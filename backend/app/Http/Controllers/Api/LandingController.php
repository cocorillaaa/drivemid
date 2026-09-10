<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PublicVehicleResource;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

/**
 * Contenido público de la landing.
 *
 * No requiere autenticación y alimenta al frontend con las soluciones, los
 * catálogos del formulario, los canales de contacto y un resumen de la flota
 * en el que los datos personales del conductor ya vienen depurados.
 */
class LandingController extends Controller
{
    public function overview(): JsonResponse
    {
        $vehicles = Vehicle::query()->orderBy('unit_code')->get();

        $totalUnits = $vehicles->count();
        $expiredPolicies = $vehicles->filter(
            fn (Vehicle $vehicle): bool => $vehicle->policyStatus() === 'vencida',
        )->count();
        $expiringPolicies = $vehicles->filter(
            fn (Vehicle $vehicle): bool => $vehicle->policyStatus() === 'por_vencer',
        )->count();

        $activeUnits = $vehicles->where('status', '!=', 'mantenimiento')->count();
        $totalWeeklyKm = (int) $vehicles->sum('weekly_km');
        $coveredUnits = $totalUnits - $expiredPolicies;
        $coveragePct = $totalUnits > 0 ? (int) round(($coveredUnits / $totalUnits) * 100) : 0;

        return response()->json([
            'data' => [
                'brand' => config('vanguard.brand'),
                'contact' => config('vanguard.contact'),
                'solutions' => config('vanguard.solutions'),
                'service_types' => config('vanguard.service_types'),
                'cities' => config('vanguard.cities'),
                'metrics' => [
                    [
                        'key' => 'active_units',
                        'value' => (string) $activeUnits,
                        'label' => 'Unidades activas en operación',
                    ],
                    [
                        'key' => 'weekly_km',
                        'value' => number_format($totalWeeklyKm),
                        'label' => 'Kilómetros recorridos esta semana',
                    ],
                    [
                        'key' => 'insurance_coverage',
                        'value' => $coveragePct.'%',
                        'label' => 'Unidades con póliza vigente',
                    ],
                    ...array_map(
                        fn (array $metric, int $index): array => ['key' => 'static_'.$index, ...$metric],
                        config('vanguard.static_metrics'),
                        array_keys(config('vanguard.static_metrics')),
                    ),
                ],
                'summary' => [
                    'total_units' => $totalUnits,
                    'active_units' => $activeUnits,
                    'on_service_units' => $vehicles->where('status', 'en_servicio')->count(),
                    'available_units' => $vehicles->where('status', 'disponible')->count(),
                    'total_weekly_km' => $totalWeeklyKm,
                    'average_weekly_km' => $totalUnits > 0 ? (int) round($totalWeeklyKm / $totalUnits) : 0,
                    'policy_alerts' => $expiredPolicies + $expiringPolicies,
                    'expired_policies' => $expiredPolicies,
                    'expiring_policies' => $expiringPolicies,
                    'insurance_coverage_pct' => $coveragePct,
                    'last_telemetry_at' => $vehicles->max('location_updated_at')?->toIso8601String(),
                ],
                'fleet' => PublicVehicleResource::collection($vehicles)->resolve(),
            ],
        ]);
    }

    /**
     * Credenciales de las cuentas de demostración.
     *
     * Sólo se exponen con `APP_DEBUG` activo: en un entorno real la respuesta
     * queda vacía y la pantalla de acceso no muestra atajos de acceso.
     */
    public function demoAccounts(): JsonResponse
    {
        $accounts = config('app.debug')
            ? array_map(
                fn (array $account): array => [
                    'name' => $account['name'],
                    'email' => $account['email'],
                    'password' => $account['password'],
                    'role' => $account['role'],
                    'scope' => $account['scope'],
                ],
                config('vanguard.demo_accounts'),
            )
            : [];

        return response()->json(['data' => array_values($accounts)]);
    }
}
