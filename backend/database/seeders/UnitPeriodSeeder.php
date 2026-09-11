<?php

namespace Database\Seeders;

use App\Models\UnitPeriod;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

/**
 * Cortes semanales de ejemplo para la demostración.
 *
 * Se marcan como `demo` en la propia fila, no sólo en un comentario: el panel
 * y el reporte leen esa marca y advierten al usuario de que las cifras no son
 * del cliente. Cuando Drive Mid capture sus primeros cortes, estos renglones
 * se borran y los indicadores pasan a ser reales.
 *
 * La serie es determinista a propósito: dos demostraciones seguidas muestran
 * el mismo panel, y por eso no se usa `fake()` aquí.
 */
class UnitPeriodSeeder extends Seeder
{
    /** Doce semanas de historia: suficiente para un reporte trimestral. */
    private const WEEKS = 12;

    public function run(): void
    {
        foreach (Vehicle::query()->get() as $vehicle) {
            $this->seedUnit($vehicle);
        }
    }

    private function seedUnit(Vehicle $vehicle): void
    {
        $lunes = now()->startOfWeek();

        for ($i = self::WEEKS; $i >= 1; $i--) {
            $inicio = $lunes->copy()->subWeeks($i);
            $semana = self::WEEKS - $i; // 0 = la más antigua

            [$km, $diasServicio, $diasTaller] = $this->operation($semana);

            // La renta se cobra completa salvo la semana en taller, que no se cobra.
            $ingreso = $diasServicio === 0 ? 0 : $vehicle->weekly_fee;
            $cobrado = $this->collected($semana, $ingreso);

            UnitPeriod::updateOrCreate(
                ['vehicle_id' => $vehicle->id, 'week_start' => $inicio->toDateString()],
                [
                    'km_driven' => $km,
                    'days_in_service' => $diasServicio,
                    'days_in_shop' => $diasTaller,
                    'gross_income' => $ingreso,
                    'collected_income' => $cobrado,
                    'maintenance_cost' => $this->maintenance($semana, $diasTaller),
                    'fuel_cost' => 0,
                    'incident_cost' => $semana === 9 ? 4_500 : 0,
                    'other_cost' => 380,
                    'driver_name' => $this->driver($semana),
                    'source' => UnitPeriod::SOURCE_DEMO,
                ],
            );
        }
    }

    /**
     * Operación de la semana: kilómetros y días.
     *
     * La semana 4 simula una unidad detenida en taller —el riesgo que el
     * estudio del cliente describe como "20 a 40 días anuales sin conductor o
     * en taller"— para que el panel muestre cómo se ve un mes malo.
     *
     * @return array{0: int, 1: int, 2: int}
     */
    private function operation(int $semana): array
    {
        $km = match ($semana) {
            2 => 486,
            3 => 452,
            4 => 0,     // semana en taller
            5 => 168,   // reincorporación parcial
            8 => 498,
            default => 405 + (($semana * 17) % 60),
        };

        $diasTaller = $semana === 4 ? 6 : ($semana === 5 ? 2 : ($semana === 9 ? 2 : 0));

        return [$km, 7 - $diasTaller, $diasTaller];
    }

    /** Cobranza: dos semanas del trimestre cerraron con mora. */
    private function collected(int $semana, int $ingreso): int
    {
        return match ($semana) {
            2 => (int) round($ingreso * 0.55),
            9 => (int) round($ingreso * 0.72),
            default => $ingreso,
        };
    }

    /** Mantenimiento: el preventivo es estable y el correctivo se concentra. */
    private function maintenance(int $semana, int $diasTaller): int
    {
        if ($diasTaller > 0) {
            return $semana === 4 ? 7_500 : 2_400;
        }

        // Mantenimiento normal: un servicio cada seis semanas.
        return $semana % 6 === 0 ? 1_800 : 0;
    }

    /** Rotación: la unidad cambió de conductor una vez en el trimestre. */
    private function driver(int $semana): string
    {
        return $semana < 7 ? 'Juan Carlos Ramírez Ortega' : 'Jorge Alberto Núñez Vega';
    }
}
