<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Actualización de telemetría de una unidad desde la vista de
 * Administrador de Unidad (kilometraje semanal y teléfono de contacto).
 */
class UpdateVehicleTelemetryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'weekly_km' => ['required_without:driver_phone', 'integer', 'min:0', 'max:5000'],
            'driver_phone' => ['required_without:weekly_km', 'string', 'regex:/^\d{10}$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'weekly_km.required_without' => 'Debe enviar el kilometraje semanal o el teléfono de contacto.',
            'weekly_km.integer' => 'El kilometraje semanal debe ser un número entero.',
            'weekly_km.min' => 'El kilometraje semanal no puede ser negativo.',
            'weekly_km.max' => 'El kilometraje semanal no puede exceder 5,000 km.',
            'driver_phone.required_without' => 'Debe enviar el kilometraje semanal o el teléfono de contacto.',
            'driver_phone.regex' => 'El teléfono debe contener exactamente 10 dígitos.',
        ];
    }
}
