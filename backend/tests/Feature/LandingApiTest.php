<?php

namespace Tests\Feature;

use Database\Seeders\UserSeeder;
use Database\Seeders\VehicleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Contenido público que alimenta el sitio (sin autenticación).
 *
 * El sitio es público: sólo puede exponer contenido institucional, nunca
 * datos operativos de la aplicación. Tampoco publica cobertura ni ciudades:
 * el negocio no se presenta como una operación geográfica, sino como un
 * programa de inversión.
 */
class LandingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([VehicleSeeder::class, UserSeeder::class]);
    }

    public function test_it_exposes_the_site_content_without_authentication(): void
    {
        $response = $this->getJson('/api/public/overview')->assertOk();

        $response->assertJsonStructure([
            'data' => [
                'brand' => ['name', 'tagline'],
                'contact' => ['phone', 'email', 'address', 'city', 'hours'],
                'about' => ['title', 'body'],
                'mission' => ['title', 'body'],
                'vision' => ['title', 'body'],
                'values' => [['key', 'title', 'description']],
                'business_model' => ['title', 'body', 'flow'],
                'work_plan' => ['title', 'intro', 'steps'],
                'audiences' => [['key', 'title', 'description', 'bullets']],
                'capital_ranges',
            ],
        ]);
    }

    public function test_it_never_exposes_operational_data(): void
    {
        $data = $this->getJson('/api/public/overview')->json('data');

        // El sitio no publica la flota, ni métricas de operación, ni datos
        // de los conductores.
        foreach (['fleet', 'summary', 'metrics', 'vehicles'] as $forbidden) {
            $this->assertArrayNotHasKey($forbidden, $data);
        }

        $payload = json_encode($data, JSON_UNESCAPED_UNICODE);

        $this->assertStringNotContainsString('YXY-669-G', $payload);
        $this->assertStringNotContainsString('5548217390', $payload);
        $this->assertStringNotContainsString('weekly_km', $payload);
        $this->assertStringNotContainsString('policy_status', $payload);
        $this->assertStringNotContainsString('tracking_url', $payload);
    }

    public function test_it_does_not_publish_coverage_or_service_catalogs(): void
    {
        $data = $this->getJson('/api/public/overview')->json('data');

        foreach (['coverage_zones', 'cities', 'pillars', 'solutions', 'service_types'] as $removed) {
            $this->assertArrayNotHasKey($removed, $data);
        }

        $payload = json_encode($data, JSON_UNESCAPED_UNICODE);

        $this->assertStringNotContainsString('zona metropolitana', $payload);
        $this->assertStringNotContainsString('corredor', $payload);
    }

    public function test_it_publishes_the_program_identity(): void
    {
        $data = $this->getJson('/api/public/overview')->json('data');

        $this->assertSame('Drive Mid', $data['brand']['name']);
        $this->assertNotEmpty($data['about']['body'][0]);
        $this->assertNotEmpty($data['mission']['body']);
        $this->assertNotEmpty($data['vision']['body']);

        $this->assertEqualsCanonicalizing(
            ['compromiso', 'responsabilidad', 'puntualidad', 'transparencia'],
            collect($data['values'])->pluck('key')->all(),
        );
    }

    public function test_it_publishes_the_business_model_and_the_work_plan(): void
    {
        $data = $this->getJson('/api/public/overview')->json('data');

        $this->assertCount(4, $data['business_model']['flow']);
        $this->assertCount(6, $data['work_plan']['steps']);

        // Las etapas llegan numeradas y en orden.
        $this->assertSame(
            ['01', '02', '03', '04', '05', '06'],
            collect($data['work_plan']['steps'])->pluck('step')->all(),
        );

        foreach ([...$data['work_plan']['steps'], ...$data['business_model']['flow']] as $item) {
            $this->assertNotEmpty($item['title']);
            $this->assertNotEmpty($item['description']);
        }
    }

    public function test_it_serves_the_catalog_used_by_the_lead_form(): void
    {
        $ranges = $this->getJson('/api/public/overview')->json('data.capital_ranges');

        $this->assertCount(4, $ranges);
        $this->assertContains('Una unidad', $ranges);

        $audiences = collect($this->getJson('/api/public/overview')->json('data.audiences'));

        $this->assertEqualsCanonicalizing(
            ['investor', 'driver'],
            $audiences->pluck('key')->all(),
        );
    }

    public function test_it_publishes_the_real_contact_channels(): void
    {
        $contact = $this->getJson('/api/public/overview')->json('data.contact');

        $this->assertSame('9991112819', $contact['phone']);
        $this->assertSame('info@drivemid.com', $contact['email']);
        $this->assertSame('Mérida, Yucatán', $contact['city']);
        $this->assertStringContainsString('Plaza San Juan Bautista', $contact['address']);
    }

    public function test_the_demo_accounts_are_only_exposed_with_debug_enabled(): void
    {
        config(['app.debug' => true]);
        $this->assertCount(2, $this->getJson('/api/public/demo-accounts')->json('data'));

        config(['app.debug' => false]);
        $this->assertSame([], $this->getJson('/api/public/demo-accounts')->json('data'));
    }
}
