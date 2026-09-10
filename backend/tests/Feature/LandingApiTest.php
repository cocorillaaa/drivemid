<?php

namespace Tests\Feature;

use Database\Seeders\UserSeeder;
use Database\Seeders\VehicleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Contenido público que alimenta la landing (sin autenticación).
 *
 * La landing es pública: sólo puede exponer contenido institucional, nunca
 * datos operativos de la aplicación.
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
                'solutions' => [['key', 'title', 'description', 'bullets']],
                'service_types',
                'cities',
                'pillars' => [['key', 'title', 'description']],
                'coverage_zones' => [['key', 'name', 'note', 'lat', 'lng']],
            ],
        ]);
    }

    public function test_it_never_exposes_operational_data(): void
    {
        $data = $this->getJson('/api/public/overview')->json('data');

        // La landing no publica la flota, ni métricas de operación, ni datos
        // de los conductores.
        foreach (['fleet', 'summary', 'metrics', 'vehicles'] as $forbidden) {
            $this->assertArrayNotHasKey($forbidden, $data);
        }

        $payload = json_encode($data, JSON_UNESCAPED_UNICODE);

        $this->assertStringNotContainsString('ABC-123', $payload);
        $this->assertStringNotContainsString('DFG-456', $payload);
        $this->assertStringNotContainsString('5548217390', $payload);
        $this->assertStringNotContainsString('weekly_km', $payload);
        $this->assertStringNotContainsString('policy_status', $payload);
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

    public function test_it_publishes_the_institutional_pillars(): void
    {
        $pillars = collect($this->getJson('/api/public/overview')->json('data.pillars'));

        $this->assertCount(4, $pillars);
        $this->assertEqualsCanonicalizing(
            ['coverage', 'availability', 'drivers', 'units'],
            $pillars->pluck('key')->all(),
        );

        $pillars->each(function (array $pillar): void {
            $this->assertNotEmpty($pillar['title']);
            $this->assertNotEmpty($pillar['description']);
        });
    }

    public function test_it_publishes_commercial_coverage_zones_with_coordinates(): void
    {
        $zones = collect($this->getJson('/api/public/overview')->json('data.coverage_zones'));

        $this->assertGreaterThanOrEqual(4, $zones->count());

        $zones->each(function (array $zone): void {
            $this->assertNotEmpty($zone['name']);
            $this->assertIsNumeric($zone['lat']);
            $this->assertIsNumeric($zone['lng']);
            // Coordenadas dentro del Valle de México.
            $this->assertTrue($zone['lat'] > 19.0 && $zone['lat'] < 19.8);
            $this->assertTrue($zone['lng'] > -99.5 && $zone['lng'] < -98.8);
        });
    }

    public function test_the_demo_accounts_are_only_exposed_with_debug_enabled(): void
    {
        config(['app.debug' => true]);
        $this->assertCount(5, $this->getJson('/api/public/demo-accounts')->json('data'));

        config(['app.debug' => false]);
        $this->assertSame([], $this->getJson('/api/public/demo-accounts')->json('data'));
    }
}
