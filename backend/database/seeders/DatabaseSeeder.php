<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Pobla la base de datos con el dataset de demostración de Drive Mid: la
     * unidad del cliente, las cuentas de acceso y los cortes semanales de
     * ejemplo que alimentan los indicadores de rendimiento.
     */
    public function run(): void
    {
        $this->call([
            VehicleSeeder::class,
            UserSeeder::class,
            UnitPeriodSeeder::class,
        ]);
    }
}
