<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Usuarios de la plataforma con credenciales sencillas para la demostración.
 *
 * Las cuentas se declaran una sola vez en `config/vanguard.php`; el mismo
 * origen alimenta la pantalla de acceso, de modo que no hay credenciales
 * duplicadas ni hardcodeadas en el frontend.
 *
 * - Un **Superusuario** con vista global de la flota.
 * - Un **Administrador de Unidad** por cada unidad, vinculado a ella mediante
 *   `vehicle_id`: esa asignación es la que limita su acceso.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        foreach (config('vanguard.demo_accounts') as $account) {
            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => $account['password'],
                    'role' => $account['role'],
                    'vehicle_id' => $account['vehicle_id'],
                    'job_title' => $account['job_title'],
                    'phone' => $account['phone'],
                ],
            );
        }
    }
}
