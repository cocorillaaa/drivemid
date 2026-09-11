<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

/**
 * Contenido público del sitio.
 *
 * No requiere autenticación y **no publica datos operativos**: ni unidades,
 * ni matrículas, ni kilometrajes, ni posiciones, ni información de los
 * conductores. Todo lo que expone es contenido institucional declarado en
 * `config/drivemid.php`, de modo que el sitio no revela el estado
 * interno de la aplicación.
 */
class LandingController extends Controller
{
    public function overview(): JsonResponse
    {
        return response()->json([
            'data' => [
                'brand' => config('drivemid.brand'),
                'contact' => config('drivemid.contact'),
                'about' => config('drivemid.about'),
                'mission' => config('drivemid.mission'),
                'vision' => config('drivemid.vision'),
                'values' => config('drivemid.values'),
                'business_model' => config('drivemid.business_model'),
                'work_plan' => config('drivemid.work_plan'),
                'audiences' => config('drivemid.audiences'),
                'capital_ranges' => config('drivemid.capital_ranges'),
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
                config('drivemid.demo_accounts'),
            )
            : [];

        return response()->json(['data' => array_values($accounts)]);
    }
}
