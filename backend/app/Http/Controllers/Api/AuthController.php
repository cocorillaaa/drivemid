<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Autenticación por token (Laravel Sanctum).
 *
 * El frontend Angular obtiene un token Bearer en `/api/auth/login` y lo envía
 * en cada petición. El token identifica al usuario y, con él, su rol y la
 * unidad que tiene asignada.
 */
class AuthController extends Controller
{
    /**
     * Inicia sesión y emite un token de acceso personal.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $email = mb_strtolower($request->string('email')->trim()->toString());
        $user = User::query()->where('email', $email)->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Las credenciales no coinciden con nuestros registros.',
            ]);
        }

        // Un token vigente por dispositivo, para no acumular sesiones.
        $device = $request->deviceName();
        $user->tokens()->where('name', $device)->delete();

        $token = $user->createToken($device)->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => UserResource::make($user->loadMissing('vehicle'))->resolve(),
            ],
            'message' => 'Sesión iniciada correctamente.',
        ]);
    }

    /**
     * Devuelve el perfil del usuario autenticado.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => UserResource::make($request->user()->loadMissing('vehicle'))->resolve(),
        ]);
    }

    /**
     * Revoca el token con el que se realizó la petición.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'data' => ['status' => 'ok'],
            'message' => 'Sesión finalizada correctamente.',
        ]);
    }
}
