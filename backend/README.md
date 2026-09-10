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

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servicio |
| `GET` | `/api/vehicles` | Listado de unidades |
| `GET` | `/api/vehicles/{id}` | Detalle de una unidad |
| `PATCH` | `/api/vehicles/{id}/telemetry` | Km semanales y teléfono de contacto |
| `GET` | `/api/fleet/summary` | Métricas agregadas |
| `POST` | `/api/leads/corporate` | Solicitud de servicio corporativo |
| `POST` | `/api/leads/drivers` | Postulación de conductor |
| `GET` | `/api/leads` | Bandeja de solicitudes |

## Estructura

```
app/
├── Models/                    Vehicle · CorporateLead · DriverApplication
├── Http/Controllers/Api/      VehicleController · LeadController
├── Http/Requests/             Validación de entrada (Form Requests)
└── Http/Resources/            VehicleResource (contrato JSON snake_case)
database/
├── migrations/                vehicles · corporate_leads · driver_applications
├── seeders/VehicleSeeder.php  Las 4 unidades de la demo
└── factories/                 Factories para pruebas
routes/api.php                 Definición de endpoints
tests/Feature/FleetApiTest.php 14 pruebas de la API
```

El dataset del seeder replica el mock del frontend
(`frontend/src/app/core/data/fleet-mock.data.ts`) para mantener paridad front/back.
