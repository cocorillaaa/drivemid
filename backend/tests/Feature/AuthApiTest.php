<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Database\Seeders\VehicleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Autenticación por token de la plataforma.
 */
class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([VehicleSeeder::class, UserSeeder::class]);
    }

    public function test_it_issues_a_token_for_valid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'superadmin@drivemid.com',
            'password' => 'admin1234',
        ])->assertOk();

        $this->assertNotEmpty($response->json('data.token'));
        $this->assertSame('Bearer', $response->json('data.token_type'));

        $response->assertJsonPath('data.user.email', 'superadmin@drivemid.com')
            ->assertJsonPath('data.user.role', User::ROLE_SUPERUSER)
            ->assertJsonPath('data.user.permissions.view_global_fleet', true)
            ->assertJsonPath('data.user.vehicle_id', null);

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_it_rejects_invalid_credentials(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'superadmin@drivemid.com',
            'password' => 'incorrecta',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_it_rejects_an_unknown_email(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'desconocido@drivemid.com',
            'password' => 'unidad123',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_it_validates_the_login_payload(): void
    {
        $this->postJson('/api/auth/login', ['email' => 'no-es-un-correo', 'password' => '123'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_the_unit_admin_profile_exposes_its_assigned_vehicle(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'unidad01@drivemid.com',
            'password' => 'unidad123',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.role', User::ROLE_UNIT_ADMIN)
            ->assertJsonPath('data.user.vehicle.unit_code', 'Unidad 01')
            ->assertJsonPath('data.user.vehicle.plates', 'YXY-669-G')
            ->assertJsonPath('data.user.permissions.view_global_fleet', false);
    }

    public function test_it_returns_the_authenticated_profile(): void
    {
        $user = User::query()->where('email', 'unidad01@drivemid.com')->firstOrFail();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'unidad01@drivemid.com')
            ->assertJsonPath('data.vehicle_id', 'unit-01')
            ->assertJsonPath('data.vehicle.unit_code', 'Unidad 01');
    }

    public function test_it_revokes_the_token_on_logout(): void
    {
        $token = $this->postJson('/api/auth/login', [
            'email' => 'unidad01@drivemid.com',
            'password' => 'unidad123',
        ])->json('data.token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        // El guard resuelto se reutiliza entre peticiones dentro del mismo
        // test; hay que descartarlo para comprobar el token revocado.
        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    public function test_protected_endpoints_require_authentication(): void
    {
        foreach (['/api/vehicles', '/api/fleet/summary', '/api/auth/me', '/api/leads'] as $endpoint) {
            $this->getJson($endpoint)->assertUnauthorized();
        }
    }

    public function test_protected_endpoints_respond_with_json_instead_of_redirecting_guests(): void
    {
        // Sin cabecera `Accept`, Laravel intentaría redirigir a una ruta `login`
        // inexistente; la API debe responder 401 JSON.
        $this->get('/api/vehicles')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'No autenticado. Inicie sesión para acceder a la plataforma.');
    }

    public function test_the_stored_password_is_hashed(): void
    {
        $user = User::query()->where('email', 'superadmin@drivemid.com')->firstOrFail();

        $this->assertNotSame('admin1234', $user->password);
        $this->assertTrue(Hash::check('admin1234', $user->password));
    }
}
