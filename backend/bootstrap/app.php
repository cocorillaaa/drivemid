<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        /*
         * API sin vistas: un invitado nunca debe ser redirigido a una ruta
         * `login` (Laravel la registra por defecto y no existe aquí). Al
         * devolver `null`, el manejador de excepciones responde 401 JSON.
         */
        $middleware->redirectGuestsTo(fn () => null);

        // CORS: la configuración vive en config/cors.php y permite el
        // origen del frontend Angular servido en http://localhost:4201.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        /*
         * API sin vistas: una petición no autenticada debe responder 401 JSON.
         *
         * Sin este manejador, `AuthenticationException::redirectTo()` intenta
         * resolver la ruta `login` (que no existe en una API) y la petición
         * termina en un error 500 en lugar de un 401.
         */
        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            return response()->json([
                'message' => 'No autenticado. Inicie sesión para acceder a la plataforma.',
            ], 401);
        });
    })->create();
