<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Alta de un interesado en el programa de inversión desde el sitio público.
 */
class StoreInvestorLeadRequest extends FormRequest
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
            'capital_range' => ['required', 'string', 'max:80'],
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
            'capital_range.required' => 'Indique el capital que le interesa considerar.',
        ];
    }
}
