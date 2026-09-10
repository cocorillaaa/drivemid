<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Alta de una postulación de conductor desde la landing pública.
 */
class StoreDriverApplicationRequest extends FormRequest
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
            'full_name' => ['required', 'string', 'min:3', 'max:120'],
            'email' => ['required', 'string', 'email:rfc', 'max:160'],
            'phone' => ['required', 'string', 'regex:/^\d{10}$/'],
            'city' => ['required', 'string', 'max:100'],
            'license_number' => ['required', 'string', 'min:8', 'max:40'],
            'experience_years' => ['required', 'integer', 'min:0', 'max:50'],
            'vehicle_owned' => ['sometimes', 'boolean'],
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
            'license_number.min' => 'Capture el número completo de la licencia federal.',
        ];
    }
}
