<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCorporateLeadRequest;
use App\Http\Requests\StoreDriverApplicationRequest;
use App\Models\CorporateLead;
use App\Models\DriverApplication;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Captación de prospectos desde la landing pública:
 * solicitudes de servicio corporativo y postulaciones de conductor.
 */
class LeadController extends Controller
{
    /**
     * Bandeja consolidada de solicitudes recibidas.
     *
     * Reservada a la vista de Superusuario: los administradores de unidad
     * sólo operan sobre su propia unidad.
     */
    public function index(Request $request): JsonResponse
    {
        abort_unless(
            $request->user()?->isSuperuser(),
            403,
            'Sólo la vista de Superusuario puede consultar la bandeja de solicitudes.',
        );

        return response()->json([
            'data' => [
                'corporate_leads' => CorporateLead::query()->latest()->limit(25)->get(),
                'driver_applications' => DriverApplication::query()->latest()->limit(25)->get(),
                'totals' => [
                    'corporate_leads' => CorporateLead::count(),
                    'driver_applications' => DriverApplication::count(),
                ],
            ],
        ]);
    }

    /**
     * Registra una solicitud de servicio corporativo.
     */
    public function storeCorporate(StoreCorporateLeadRequest $request): JsonResponse
    {
        $lead = CorporateLead::create([
            ...$request->safe()->only([
                'company',
                'contact_name',
                'email',
                'phone',
                'service_type',
                'units',
                'city',
                'message',
            ]),
            'reference' => $this->generateReference('COR', CorporateLead::class),
        ]);

        return response()->json([
            'data' => ['id' => $lead->id, 'reference' => $lead->reference],
            'message' => 'Solicitud de servicio corporativo registrada.',
        ], 201);
    }

    /**
     * Registra una postulación de conductor.
     */
    public function storeDriver(StoreDriverApplicationRequest $request): JsonResponse
    {
        $application = DriverApplication::create([
            ...$request->safe()->only([
                'full_name',
                'email',
                'phone',
                'city',
                'license_number',
                'experience_years',
                'vehicle_owned',
                'message',
            ]),
            'reference' => $this->generateReference('CON', DriverApplication::class),
        ]);

        return response()->json([
            'data' => ['id' => $application->id, 'reference' => $application->reference],
            'message' => 'Postulación de conductor registrada.',
        ], 201);
    }

    /**
     * Genera un folio de seguimiento único para el prospecto.
     *
     * @param  class-string<Model>  $model
     */
    private function generateReference(string $prefix, string $model): string
    {
        do {
            $reference = sprintf('VF-%s-%s', $prefix, Str::upper(Str::random(5)));
        } while ($model::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
