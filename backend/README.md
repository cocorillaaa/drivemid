# Drive Mid · API (Laravel 13)

API REST JSON que alimenta el sistema del programa de inversión en movilidad. La
documentación completa del proyecto está en el [README raíz](../README.md).

```bash
composer install
cp .env.example .env && php artisan key:generate
mysql -u root -p -e "CREATE DATABASE drivemid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8001
php artisan test --compact
```

## Endpoints

### Públicos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servicio |
| `GET` | `/api/public/overview` | Contenido del sitio público |
| `GET` | `/api/public/demo-accounts` | Cuentas de prueba (vacío salvo con `APP_DEBUG`) |
| `POST` | `/api/leads/investors` | Interés en el programa de inversión |
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
| `GET` | `/api/leads` | Bandeja de prospectos (sólo Superusuario) |

## Autorización

`app/Policies/VehiclePolicy.php` concentra las reglas: un **Superusuario** opera sobre toda
la flota y un **Administrador de Unidad** sólo sobre la unidad de `users.vehicle_id`.

## Cuentas del seeder

| Rol | Correo | Contraseña |
|---|---|---|
| Superusuario | `superadmin@drivemid.com` | `admin1234` |
| Administrador de Unidad 01 | `unidad01@drivemid.com` | `unidad123` |

Se declaran una sola vez en `config/drivemid.php`; el mismo origen alimenta `UserSeeder`
y la pantalla de acceso del frontend.

## Estructura

```
app/
├── Models/                    Vehicle · User · InvestorLead · DriverApplication
├── Policies/VehiclePolicy.php Reglas de acceso por rol
├── Http/Controllers/Api/      Auth · Vehicle · Landing · Lead
├── Http/Requests/             Validación de entrada (Form Requests)
└── Http/Resources/            Vehicle · User (contrato snake_case)
config/drivemid.php            Identidad, contenido del sitio y cuentas de demostración
database/
├── migrations/                vehicles · users(+rol y unidad) · investor_leads · tokens
├── seeders/                   VehicleSeeder · UserSeeder
└── factories/                 Factories para pruebas
routes/api.php                 Endpoints públicos y protegidos
tests/Feature/                 AuthApiTest · FleetApiTest · LandingApiTest (37 pruebas)
```

El seeder carga la unidad real del cliente —Chevrolet Aveo 2022, placas YXY-669-G— con los
datos de conductor, póliza y kilometraje todavía de ejemplo. El seguimiento de esa unidad es
un enlace externo (`vehicles.tracking_url`): el cliente rastrea con un link por vehículo, no
con una API, así que el enlace real no se versiona y el seeder usa un marcador.
