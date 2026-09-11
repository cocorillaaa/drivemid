<?php

namespace Tests\Feature;

use App\Models\UnitPeriod;
use App\Models\User;
use App\Models\Vehicle;
use Database\Seeders\UnitPeriodSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\VehicleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Indicadores de rendimiento del programa.
 *
 * Estas pruebas fijan la aritmética: si alguien cambia el cálculo, tiene que
 * cambiar también el número esperado y explicar por qué. Los importes son
 * deliberadamente redondos para que la comprobación se lea a mano.
 */
class PerformanceApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([VehicleSeeder::class, UserSeeder::class]);
    }

    private function superuser(): User
    {
        return User::query()->where('role', User::ROLE_SUPERUSER)->firstOrFail();
    }

    private function unitAdmin(): User
    {
        return User::query()->where('role', User::ROLE_UNIT_ADMIN)->firstOrFail();
    }

    /**
     * Unidad con condiciones conocidas y una sola semana de historia.
     */
    private function unitWithPeriod(array $vehicle = [], array $period = []): Vehicle
    {
        $vehicle = Vehicle::factory()->create([
            'id' => 'unit-99',
            'unit_code' => 'Unidad 99',
            'plates' => 'TST-999-T',
            'vin' => 'TST00000000000099',
            'capital_invested' => 200_000,
            'weekly_fee' => 4_000,
            'maintenance_reserve' => 700,
            'security_deposit' => 5_000,
            // Sin costos fijos: así el resultado depende sólo del corte.
            'monthly_insurance_cost' => 0,
            'monthly_tracking_cost' => 0,
            'monthly_admin_cost' => 0,
            'financials_are_demo' => false,
            ...$vehicle,
        ]);

        UnitPeriod::factory()->create([
            'vehicle_id' => $vehicle->id,
            'week_start' => '2026-08-03',
            'km_driven' => 400,
            'days_in_service' => 5,
            'days_in_shop' => 2,
            'gross_income' => 4_000,
            'collected_income' => 3_000,
            'maintenance_cost' => 1_000,
            'fuel_cost' => 0,
            'incident_cost' => 0,
            'other_cost' => 0,
            'driver_name' => 'Conductor Uno',
            'source' => 'capturado',
            ...$period,
        ]);

        return $vehicle;
    }

    public function test_the_program_performance_is_reserved_to_the_superuser(): void
    {
        $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/performance')
            ->assertOk()
            ->assertJsonPath('data.weeks', 12);

        $this->actingAs($this->unitAdmin(), 'sanctum')
            ->getJson('/api/performance')
            ->assertForbidden();

        $this->actingAs($this->unitAdmin(), 'sanctum')
            ->getJson('/api/performance/unit-01')
            ->assertForbidden();
    }

    public function test_it_requires_authentication(): void
    {
        $this->getJson('/api/performance')->assertUnauthorized();
    }

    public function test_it_derives_every_indicator_from_the_weekly_cut(): void
    {
        $this->unitWithPeriod();

        $data = $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/performance/unit-99')
            ->assertOk()
            ->json('data');

        $performance = $data['performance'];

        // Operación: 5 días en servicio de 7 disponibles, 400 de 412 km.
        $this->assertSame(400, $performance['km']);
        $this->assertSame(7, $performance['days_available']);
        $this->assertSame(5, $performance['days_in_service']);
        $this->assertSame(2, $performance['days_off_road']);
        $this->assertEquals(97.1, $performance['utilization_pct']);
        $this->assertEquals(71.4, $performance['availability_pct']);

        // Dinero: 4,000 facturados, 3,000 cobrados, 1,000 de mora.
        $this->assertSame(4_000, $performance['gross_income']);
        $this->assertSame(3_000, $performance['collected_income']);
        $this->assertSame(1_000, $performance['outstanding_income']);
        $this->assertEquals(25.0, $performance['delinquency_pct']);

        // Reserva: 700 por los 7 días del periodo, aunque sólo 5 haya rodado.
        $this->assertSame(700, $performance['reserve']);

        // Resultado: 4,000 − 1,000 de mantenimiento (sin costos fijos) = 3,000.
        // Flujo: al resultado se le descuenta la reserva, que no es un gasto
        // sino dinero que deja de estar disponible para distribuir.
        $this->assertSame(1_000, $performance['direct_costs']);
        $this->assertSame(3_000, $performance['operating_result']);
        $this->assertSame(2_300, $performance['net_flow']);
        // Llevado a un mes promedio: 2,300 × (30.44 / 7) = 10,002.
        $this->assertSame(10_002, $performance['monthly_net_flow']);

        // Promedios del periodo.
        $this->assertSame(800, $performance['gross_income_per_day']);
        $this->assertSame(460, $performance['net_flow_per_day']);
        $this->assertEquals(5.75, $performance['net_flow_per_km']);
        $this->assertEquals(2.5, $performance['maintenance_cost_per_km']);

        // La cifra no es de ejemplo: el cliente todavía no entrega las suyas.
        $this->assertFalse($performance['financials_are_demo']);
    }

    public function test_the_reserve_accrues_even_when_the_unit_is_in_the_shop(): void
    {
        // Una semana completa en taller: no hay ingreso, pero la unidad sigue
        // en el programa y su reserva se sigue apartando. Es una provisión
        // contra el desgaste del activo, no un porcentaje de lo que produjo.
        $this->unitWithPeriod(period: [
            'km_driven' => 0,
            'days_in_service' => 0,
            'days_in_shop' => 7,
            'gross_income' => 0,
            'collected_income' => 0,
            'maintenance_cost' => 9_000,
        ]);

        $performance = $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/performance/unit-99')
            ->json('data.performance');

        $this->assertSame(700, $performance['reserve']);
        $this->assertSame(7, $performance['days_off_road']);
        $this->assertEquals(0.0, $performance['availability_pct']);
        // La reparación y la reserva convierten la semana en pérdida.
        $this->assertSame(-9_700, $performance['net_flow']);
    }

    public function test_it_counts_driver_changes_as_turnover(): void
    {
        $vehicle = $this->unitWithPeriod();

        UnitPeriod::factory()->create([
            'vehicle_id' => $vehicle->id,
            'week_start' => '2026-08-10',
            'driver_name' => 'Conductor Dos',
        ]);

        $performance = $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/performance/unit-99')
            ->json('data.performance');

        $this->assertSame(2, $performance['weeks']);
        $this->assertSame(1, $performance['driver_turnover']);
        $this->assertEqualsCanonicalizing(
            ['Conductor Uno', 'Conductor Dos'],
            $performance['driver_names'],
        );
    }

    public function test_a_unit_without_cuts_reports_zeros_and_not_an_error(): void
    {
        $data = $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/performance/unit-01')
            ->assertOk()
            ->json('data');

        $this->assertSame(0, $data['performance']['weeks']);
        $this->assertSame(0, $data['performance']['net_flow']);
        $this->assertEquals(0.0, $data['performance']['annualized_return_pct']);
        $this->assertSame([], $data['periods']);
    }

    public function test_the_window_can_be_narrowed_and_is_bounded(): void
    {
        $this->unitWithPeriod();

        $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/performance/unit-99?weeks=4')
            ->assertOk()
            ->assertJsonPath('data.weeks', 4);

        $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/performance?weeks=200')
            ->assertStatus(422)
            ->assertJsonValidationErrors('weeks');
    }

    public function test_the_seeded_demo_marks_its_figures_as_examples(): void
    {
        $this->seed(UnitPeriodSeeder::class);

        $data = $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/performance')
            ->assertOk()
            ->json('data');

        $this->assertTrue($data['demo_data']);
        $this->assertSame(1, $data['program']['units_with_data']);
        $this->assertSame(12, $data['units'][0]['weeks']);
        $this->assertCount(12, $data['units'][0]['series']);
        $this->assertGreaterThan(0, $data['program']['gross_income']);
    }
}
