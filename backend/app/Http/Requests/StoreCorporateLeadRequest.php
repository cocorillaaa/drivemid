<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Alta de una solicitud de servicio corporativo desde la landing pública.
 */
class StoreCorporateLeadRequest extends FormRequest
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
            'company' => ['required', 'string', 'min:2', 'max:160'],
            'contact_name' => ['required', 'string', 'min:3', 'max:120'],
            'email' => ['required', 'string', 'email:rfc', 'max:160'],
            'phone' => ['required', 'string', 'regex:/^\d{10}$/'],
            'service_type' => ['required', 'string', 'max:80'],
            'units' => ['required', 'integer', 'min:1', 'max:50'],
            'city' => ['required', 'string', 'max:100'],
            'message' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'El teléfono debe contener exactamente 10 dígitos.',
            'units.min' => 'Debe solicitar al menos una unidad.',
            'units.max' => 'El máximo de unidades por solicitud es 50.',
        ];
    }
}
