<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDriverApplicationRequest;
use App\Http\Requests\StoreInvestorLeadRequest;
use App\Models\DriverApplication;
use App\Models\InvestorLead;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Captación de prospectos desde el sitio público: interesados en invertir y
 * postulaciones de conductor.
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
                'investor_leads' => InvestorLead::query()->latest()->limit(25)->get(),
                'driver_applications' => DriverApplication::query()->latest()->limit(25)->get(),
                'totals' => [
                    'investor_leads' => InvestorLead::count(),
                    'driver_applications' => DriverApplication::count(),
                ],
            ],
        ]);
    }

    /**
     * Registra el interés de un inversionista.
     */
    public function storeInvestor(StoreInvestorLeadRequest $request): JsonResponse
    {
        $lead = InvestorLead::create([
            ...$request->safe()->only([
                'full_name',
                'email',
                'phone',
                'city',
                'capital_range',
                'message',
            ]),
            'reference' => $this->generateReference('INV', InvestorLead::class),
        ]);

        return response()->json([
            'data' => ['id' => $lead->id, 'reference' => $lead->reference],
            'message' => 'Interés en el programa registrado.',
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
            $reference = sprintf('DL-%s-%s', $prefix, Str::upper(Str::random(5)));
        } while ($model::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
