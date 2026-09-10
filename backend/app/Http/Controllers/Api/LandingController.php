<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

/**
 * Contenido público de la landing.
 *
 * No requiere autenticación y **no publica datos operativos**: ni unidades,
 * ni matrículas, ni kilometrajes, ni posiciones, ni información de los
 * conductores. Todo lo que expone es contenido institucional declarado en
 * `config/demologistics.php`, de modo que la landing no revela el estado
 * interno de la aplicación.
 */
class LandingController extends Controller
{
    public function overview(): JsonResponse
    {
        return response()->json([
            'data' => [
                'brand' => config('demologistics.brand'),
                'contact' => config('demologistics.contact'),
                'solutions' => config('demologistics.solutions'),
                'service_types' => config('demologistics.service_types'),
                'cities' => config('demologistics.cities'),
                'pillars' => config('demologistics.pillars'),
                'coverage_zones' => config('demologistics.coverage_zones'),
            ],
        ]);
    }

    /**
     * Credenciales de las cuentas de demostración.
     *
     * Sólo se exponen con `APP_DEBUG` activo: en un entorno real la respuesta
     * queda vacía y la pantalla de acceso no muestra atajos.
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
                config('demologistics.demo_accounts'),
            )
            : [];

        return response()->json(['data' => array_values($accounts)]);
    }
}
