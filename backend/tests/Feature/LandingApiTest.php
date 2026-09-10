<?php

namespace Tests\Feature;

use Database\Seeders\UserSeeder;
use Database\Seeders\VehicleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Contenido público que alimenta la landing (sin autenticación).
 */
class LandingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([VehicleSeeder::class, UserSeeder::class]);
    }

    public function test_it_exposes_the_landing_content_without_authentication(): void
    {
        $response = $this->getJson('/api/public/overview')->assertOk();

        $response->assertJsonStructure([
            'data' => [
                'brand' => ['name', 'tagline'],
                'contact' => ['phone', 'email', 'address', 'hours'],
                'solutions' => [['key', 'icon', 'title', 'description', 'bullets']],
                'service_types',
                'cities',
                'metrics' => [['key', 'value', 'label']],
                'summary' => [
                    'total_units', 'active_units', 'on_service_units', 'available_units',
                    'total_weekly_km', 'average_weekly_km', 'policy_alerts',
                    'expired_policies', 'expiring_policies', 'insurance_coverage_pct',
                ],
                'fleet' => [[
                    'id', 'unit_code', 'make', 'model', 'year', 'plates', 'service_tier',
                    'capacity', 'status', 'weekly_km', 'policy_status',
                    'policy_days_to_expire', 'driver_first_name', 'location',
                ]],
            ],
        ]);
    }

    public function test_it_derives_the_metrics_from_the_real_fleet(): void
    {
        $data = $this->getJson('/api/public/overview')->json('data');

        $this->assertSame(4, $data['summary']['total_units']);
        $this->assertSame(1941, $data['summary']['total_weekly_km']);
        $this->assertSame(75, $data['summary']['insurance_coverage_pct']);

        $metrics = collect($data['metrics'])->keyBy('key');
        $this->assertSame('4', $metrics['active_units']['value']);
        $this->assertSame('1,941', $metrics['weekly_km']['value']);
        $this->assertSame('75%', $metrics['insurance_coverage']['value']);
    }

    public function test_it_never_exposes_driver_personal_data_publicly(): void
    {
        $unit = $this->getJson('/api/public/overview')->json('data.fleet.0');

        $this->assertArrayNotHasKey('driver_phone', $unit);
        $this->assertArrayNotHasKey('driver_email', $unit);
        $this->assertArrayNotHasKey('driver_name', $unit);
        $this->assertArrayNotHasKey('vin', $unit);

        // Sólo el nombre de pila del conductor.
        $this->assertSame('Juan', $unit['driver_first_name']);
    }

    public function test_it_serves_the_catalogs_used_by_the_lead_form(): void
    {
        $data = $this->getJson('/api/public/overview')->json('data');

        $this->assertCount(4, $data['solutions']);
        $this->assertCount(4, $data['service_types']);
        $this->assertCount(7, $data['cities']);
        $this->assertContains('Transporte corporativo', $data['service_types']);
        $this->assertContains('Monterrey, Nuevo León', $data['cities']);
    }
}
