<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validación del inicio de sesión en la plataforma.
 */
class LoginRequest extends FormRequest
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
            'email' => ['required', 'string', 'email:rfc', 'max:160'],
            'password' => ['required', 'string', 'min:6', 'max:120'],
            'device_name' => ['sometimes', 'string', 'max:80'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Ingrese su correo corporativo.',
            'email.email' => 'El correo no tiene un formato válido.',
            'password.required' => 'Ingrese su contraseña.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ];
    }

    /** Nombre del dispositivo con el que se registra el token. */
    public function deviceName(): string
    {
        return $this->string('device_name', 'plataforma-web')->toString();
    }
}
