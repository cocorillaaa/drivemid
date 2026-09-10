<?php

use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API de Vanguard Fleet (puerto 8001)
|--------------------------------------------------------------------------
|
| Endpoints consumidos por el frontend Angular (puerto 4201):
|
|   GET    /api/health                          Estado del servicio
|   GET    /api/fleet/summary                   Métricas agregadas de la flota
|   GET    /api/vehicles                        Listado de unidades
|   GET    /api/vehicles/{vehicle}              Detalle de una unidad
|   PATCH  /api/vehicles/{vehicle}/telemetry    Km semanales y teléfono
|   POST   /api/leads/corporate                 Solicitud de servicio corporativo
|   POST   /api/leads/drivers                   Postulación de conductor
|   GET    /api/leads                           Bandeja de solicitudes recibidas
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

Route::get('/fleet/summary', [VehicleController::class, 'summary']);

Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);
Route::patch('/vehicles/{vehicle}/telemetry', [VehicleController::class, 'updateTelemetry']);

Route::post('/leads/corporate', [LeadController::class, 'storeCorporate']);
Route::post('/leads/drivers', [LeadController::class, 'storeDriver']);
Route::get('/leads', [LeadController::class, 'index']);
