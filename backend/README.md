# Vanguard Fleet · API (Laravel 13)

API REST JSON que alimenta la plataforma ejecutiva de gestión de flota. La documentación
completa del proyecto está en el [README raíz](../README.md).

```bash
composer install
cp .env.example .env && php artisan key:generate
mysql -u root -p -e "CREATE DATABASE vanguard_fleet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8001
php artisan test --compact
```

## Endpoints

### Públicos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servicio |
| `GET` | `/api/public/overview` | Contenido de la landing + flota publicada |
| `GET` | `/api/public/demo-accounts` | Cuentas de prueba (vacío salvo con `APP_DEBUG`) |
| `POST` | `/api/leads/corporate` | Solicitud de servicio corporativo |
| `POST` | `/api/leads/drivers` | Postulación de conductor |

### Autenticación (Sanctum)

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Credenciales → token Bearer |
| `GET` | `/api/auth/me` | Perfil, rol, unidad asignada y permisos |
| `POST` | `/api/auth/logout` | Revoca el token |

### Protegidos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/vehicles` | Unidades visibles según el rol |
| `GET` | `/api/vehicles/{id}` | Detalle (403 si no corresponde) |
| `PATCH` | `/api/vehicles/{id}/telemetry` | Km semanales y teléfono de contacto |
| `GET` | `/api/fleet/summary` | Métricas agregadas (sólo Superusuario) |
| `GET` | `/api/leads` | Bandeja de solicitudes (sólo Superusuario) |

## Autorización

`app/Policies/VehiclePolicy.php` concentra las reglas: un **Superusuario** opera sobre toda
la flota y un **Administrador de Unidad** sólo sobre la unidad de `users.vehicle_id`.

## Cuentas del seeder

| Rol | Correo | Contraseña |
|---|---|---|
| Superusuario | `superadmin@vanguardfleet.mx` | `admin1234` |
| Administrador de Unidad 01…04 | `unidad0N@vanguardfleet.mx` | `unidad123` |

Se declaran una sola vez en `config/vanguard.php`; el mismo origen alimenta
`UserSeeder` y la pantalla de acceso del frontend.

## Estructura

```
app/
├── Models/                    Vehicle · User · CorporateLead · DriverApplication
├── Policies/VehiclePolicy.php Reglas de acceso por rol
├── Http/Controllers/Api/      Auth · Vehicle · Landing · Lead
├── Http/Requests/             Validación de entrada (Form Requests)
└── Http/Resources/            Vehicle · PublicVehicle · User (contrato snake_case)
config/vanguard.php            Contenido comercial + cuentas de demostración
database/
├── migrations/                vehicles · users(+rol y unidad) · leads · tokens
├── seeders/                   VehicleSeeder · UserSeeder
└── factories/                 Factories para pruebas
routes/api.php                 Endpoints públicos y protegidos
tests/Feature/                 AuthApiTest · FleetApiTest · LandingApiTest (32 pruebas)
```

El dataset del seeder replica el mock del frontend
(`frontend/src/app/core/data/fleet-mock.data.ts`) para mantener paridad front/back.
