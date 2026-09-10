<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LandingController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API de Vanguard Fleet (puerto 8001)
|--------------------------------------------------------------------------
|
| Endpoints públicos (landing):
|
|   GET    /api/health                     Estado del servicio
|   GET    /api/public/overview            Contenido y flota pública de la landing
|   POST   /api/leads/corporate            Solicitud de servicio corporativo
|   POST   /api/leads/drivers              Postulación de conductor
|
| Autenticación por token (Sanctum):
|
|   POST   /api/auth/login                 Credenciales → token Bearer
|
| Endpoints protegidos:
|
|   GET    /api/auth/me                    Perfil del usuario autenticado
|   POST   /api/auth/logout                Revoca el token
|   GET    /api/vehicles                   Superusuario: toda la flota · Unidad: sólo la asignada
|   GET    /api/vehicles/{vehicle}         Detalle (autorizado por política)
|   PATCH  /api/vehicles/{vehicle}/telemetry  Km semanales y teléfono de contacto
|   GET    /api/fleet/summary              Métricas globales (sólo Superusuario)
|   GET    /api/leads                      Bandeja de solicitudes (sólo Superusuario)
|
*/

Route::get('/health', fn () => response()->json([
    'data' => [
        'status' => 'ok',
        'service' => 'vanguard-fleet-api',
        'version' => app()->version(),
        'php' => PHP_VERSION,
        'timestamp' => now()->toIso8601String(),
    ],
]));

/*
|--------------------------------------------------------------------------
| Público
|--------------------------------------------------------------------------
*/

Route::get('/public/overview', [LandingController::class, 'overview']);
Route::get('/public/demo-accounts', [LandingController::class, 'demoAccounts']);

Route::post('/leads/corporate', [LeadController::class, 'storeCorporate']);
Route::post('/leads/drivers', [LeadController::class, 'storeDriver']);

/*
|--------------------------------------------------------------------------
| Autenticación
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:20,1');

/*
|--------------------------------------------------------------------------
| Requiere sesión iniciada
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/fleet/summary', [VehicleController::class, 'summary']);

    Route::get('/leads', [LeadController::class, 'index']);

    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);
    Route::patch('/vehicles/{vehicle}/telemetry', [VehicleController::class, 'updateTelemetry']);
});
