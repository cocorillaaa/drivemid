<?php

namespace Tests\Feature;

use App\Models\DriverApplication;
use App\Models\InvestorLead;
use App\Models\User;
use App\Models\Vehicle;
use Database\Seeders\UserSeeder;
use Database\Seeders\VehicleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Flota, telemetría y captación de prospectos, con el alcance que impone
 * el rol del usuario autenticado.
 *
 * La operación del cliente arranca con una sola unidad cargada desde su hoja
 * de captura, así que las pruebas de autorización crean unidades adicionales
 * con la fábrica en lugar de depender de un sembrado grande.
 */
class FleetApiTest extends TestCase
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

    private function unitAdmin(string $vehicleId): User
    {
        return User::query()->where('vehicle_id', $vehicleId)->firstOrFail();
    }

    /** Crea una segunda unidad con un administrador propio. */
    private function secondUnit(): Vehicle
    {
        return Vehicle::factory()->create([
            'id' => 'unit-02',
            'unit_code' => 'Unidad 02',
            'plates' => 'ZZZ-999-Z',
            'vin' => 'ZZZ00000000000002',
            'weekly_km' => 536,
        ]);
    }

    public function test_health_endpoint_reports_the_service_as_available(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('data.status', 'ok')
            ->assertJsonPath('data.service', 'drivemid-api');
    }

    public function test_the_superuser_lists_the_fleet_with_the_frontend_contract(): void
    {
        $response = $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/vehicles')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));

        $response->assertJsonPath('data.0.id', 'unit-01')
            ->assertJsonPath('data.0.unit_code', 'Unidad 01')
            ->assertJsonPath('data.0.make', 'Chevrolet')
            ->assertJsonPath('data.0.model', 'Aveo')
            ->assertJsonPath('data.0.plates', 'YXY-669-G')
            ->assertJsonPath('data.0.weekly_km', 412)
            ->assertJsonStructure([
                'data' => [[
                    'id', 'unit_code', 'make', 'model', 'year', 'plates', 'vin', 'status',
                    'odometer_km', 'weekly_km', 'weekly_km_by_day', 'fuel_level',
                    'driver_name', 'driver_phone', 'driver_email', 'driver_license', 'driver_rating',
                    'policy_provider', 'policy_number', 'policy_valid_from', 'policy_valid_to',
                    'policy_status', 'policy_days_to_expire',
                    'location_label', 'location_lat', 'location_lng', 'location_updated_at',
                    'tracking_url',
                ]],
            ]);
    }

    public function test_the_unit_carries_the_client_tracking_link(): void
    {
        $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/vehicles/unit-01')
            ->assertOk()
            ->assertJsonPath('data.tracking_url', 'https://seguimiento.ejemplo.mx/u/YXY669G');
    }

    public function test_a_unit_admin_only_lists_its_assigned_unit(): void
    {
        $this->secondUnit();

        $response = $this->actingAs($this->unitAdmin('unit-01'), 'sanctum')
            ->getJson('/api/vehicles')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $response->assertJsonPath('data.0.id', 'unit-01')
            ->assertJsonPath('data.0.unit_code', 'Unidad 01');
    }

    public function test_a_unit_admin_can_view_its_own_unit(): void
    {
        $this->actingAs($this->unitAdmin('unit-01'), 'sanctum')
            ->getJson('/api/vehicles/unit-01')
            ->assertOk()
            ->assertJsonPath('data.make', 'Chevrolet')
            ->assertJsonPath('data.model', 'Aveo')
            ->assertJsonPath('data.policy_number', 'QLT-2026-884512');
    }

    public function test_a_unit_admin_cannot_view_another_unit(): void
    {
        $this->secondUnit();

        $this->actingAs($this->unitAdmin('unit-01'), 'sanctum')
            ->getJson('/api/vehicles/unit-02')
            ->assertForbidden();
    }

    public function test_a_unit_admin_cannot_update_another_unit(): void
    {
        $this->secondUnit();

        $this->actingAs($this->unitAdmin('unit-01'), 'sanctum')
            ->patchJson('/api/vehicles/unit-02/telemetry', ['weekly_km' => 999])
            ->assertForbidden();

        $this->assertSame(536, Vehicle::query()->findOrFail('unit-02')->weekly_km);
    }

    public function test_the_superuser_can_view_any_unit(): void
    {
        $this->secondUnit();

        foreach (['unit-01', 'unit-02'] as $id) {
            $this->actingAs($this->superuser(), 'sanctum')
                ->getJson("/api/vehicles/{$id}")
                ->assertOk();
        }
    }

    public function test_it_returns_not_found_for_an_unknown_unit(): void
    {
        $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/vehicles/unit-99')
            ->assertNotFound();
    }

    public function test_the_fleet_summary_is_reserved_to_the_superuser(): void
    {
        $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/fleet/summary')
            ->assertOk()
            ->assertJsonPath('data.total_units', 1)
            ->assertJsonPath('data.active_units', 1)
            ->assertJsonPath('data.on_service_units', 1)
            ->assertJsonPath('data.available_units', 0)
            ->assertJsonPath('data.policy_alerts', 0);

        $this->actingAs($this->unitAdmin('unit-01'), 'sanctum')
            ->getJson('/api/fleet/summary')
            ->assertForbidden();
    }

    public function test_it_updates_weekly_mileage_and_contact_phone(): void
    {
        $this->actingAs($this->unitAdmin('unit-01'), 'sanctum')
            ->patchJson('/api/vehicles/unit-01/telemetry', [
                'weekly_km' => 455,
                'driver_phone' => '5599887766',
            ])
            ->assertOk()
            ->assertJsonPath('data.weekly_km', 455)
            ->assertJsonPath('data.driver_phone', '5599887766');

        $vehicle = Vehicle::query()->findOrFail('unit-01');

        $this->assertSame(455, $vehicle->weekly_km);
        $this->assertSame(455, array_sum($vehicle->weekly_km_by_day));
    }

    public function test_it_rejects_a_phone_number_that_is_not_ten_digits(): void
    {
        $this->actingAs($this->unitAdmin('unit-01'), 'sanctum')
            ->patchJson('/api/vehicles/unit-01/telemetry', ['driver_phone' => '12345'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('driver_phone');
    }

    public function test_it_requires_at_least_one_field_on_telemetry_update(): void
    {
        $this->actingAs($this->unitAdmin('unit-01'), 'sanctum')
            ->patchJson('/api/vehicles/unit-01/telemetry', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['weekly_km', 'driver_phone']);
    }

    public function test_it_registers_an_investor_lead_without_authentication(): void
    {
        $response = $this->postJson('/api/leads/investors', [
            'full_name' => 'Mariana Solís Aguilar',
            'email' => 'mariana.solis@correo.com',
            'phone' => '9991234567',
            'city' => 'Mérida, Yucatán',
            'capital_range' => 'Dos a cuatro unidades',
            'message' => 'Quiero conocer el esquema antes de decidir.',
        ])->assertCreated();

        $reference = $response->json('data.reference');

        $this->assertIsString($reference);
        $this->assertStringStartsWith('DL-INV-', $reference);
        $this->assertDatabaseHas('investor_leads', [
            'full_name' => 'Mariana Solís Aguilar',
            'reference' => $reference,
            'capital_range' => 'Dos a cuatro unidades',
        ]);
    }

    public function test_it_validates_the_investor_lead(): void
    {
        $this->postJson('/api/leads/investors', ['full_name' => 'X'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['full_name', 'email', 'phone', 'city', 'capital_range']);

        $this->assertSame(0, InvestorLead::count());
    }

    public function test_it_registers_a_driver_application(): void
    {
        $response = $this->postJson('/api/leads/drivers', [
            'full_name' => 'Jorge Alberto Núñez Vega',
            'email' => 'jorge.nunez@correo.com',
            'phone' => '9991223344',
            'city' => 'Mérida, Yucatán',
            'license_number' => 'NUVJ900101HNLSGR02',
            'experience_years' => 9,
            'vehicle_owned' => false,
        ])->assertCreated();

        $this->assertStringStartsWith('DL-CON-', $response->json('data.reference'));
        $this->assertDatabaseHas('driver_applications', [
            'full_name' => 'Jorge Alberto Núñez Vega',
            'vehicle_owned' => false,
        ]);
    }

    public function test_the_leads_inbox_is_reserved_to_the_superuser(): void
    {
        InvestorLead::factory()->count(2)->create();
        DriverApplication::factory()->count(3)->create();

        $this->actingAs($this->superuser(), 'sanctum')
            ->getJson('/api/leads')
            ->assertOk()
            ->assertJsonPath('data.totals.investor_leads', 2)
            ->assertJsonPath('data.totals.driver_applications', 3);

        $this->actingAs($this->unitAdmin('unit-01'), 'sanctum')
            ->getJson('/api/leads')
            ->assertForbidden();
    }
}
