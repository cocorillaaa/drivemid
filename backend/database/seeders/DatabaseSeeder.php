<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Pobla la base de datos con el dataset de demostración de Vanguard Fleet:
     * las 4 unidades ejecutivas y las cuentas de acceso a la plataforma.
     */
    public function run(): void
    {
        $this->call([
            VehicleSeeder::class,
            UserSeeder::class,
        ]);
    }
}
