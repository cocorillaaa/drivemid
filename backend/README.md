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
| `GET` | `/api/performance` | Rendimiento del programa y de cada unidad (sólo Superusuario) |
| `GET` | `/api/performance/{vehicle}` | Rendimiento de una unidad con su bitácora de cortes (sólo Superusuario) |
| `GET` | `/api/leads` | Bandeja de prospectos (sólo Superusuario) |

Los dos endpoints de rendimiento aceptan el parámetro **`weeks`** —la ventana observada, en
semanas— con 12 por omisión y 52 como máximo; fuera de ese rango la respuesta es 422.

## Rendimiento

`unit_periods` guarda **un corte semanal por unidad** (único por `vehicle_id` + `week_start`) y es
la única fuente de histórico del sistema: sin ella los indicadores del estudio del cliente
—utilización, ingreso bruto y neto por día, flujo neto por unidad, costo de mantenimiento por km,
kilometraje mensual, días fuera de servicio, mora y rotación de conductores— no serían
calculables, porque una foto del estado actual no dice nada del desempeño.

Las condiciones económicas de cada unidad viven en `vehicles`: `capital_invested`, `weekly_fee`,
`maintenance_reserve`, `security_deposit`, `monthly_insurance_cost`, `monthly_tracking_cost`,
`monthly_admin_cost`, `acquired_on` y `financials_are_demo`.

Todo el cálculo está en `app/Services/UnitPerformanceCalculator.php`, y sus convenciones son
discutibles a propósito:

- El **ingreso del periodo** es la renta registrada en el corte (cero cuando la unidad no operó) y
  `collected_income` es lo efectivamente cobrado: la mora es la diferencia, no un campo aparte.
- Los **costos fijos** se declaran por mes y se prorratean por día del periodo (promedio de 30.44
  días), porque un periodo puede ser más corto que un mes.
- La **reserva** se devenga por los días del periodo aunque la unidad esté en taller: es una
  provisión contra el desgaste del activo, no un porcentaje de lo producido.
- La **utilización** se mide contra `Vehicle::TARGET_WEEKLY_KM` (412 km semanales, el dato que el
  cliente reportó para su Aveo).
- El **retorno anualizado** es una proyección lineal del flujo observado y **no una garantía**,
  tal como insiste el estudio.

Los dos endpoints están reservados al Superusuario: con una sola unidad, el detalle económico
identifica de inmediato al conductor y su renta. Si un inversionista necesita consultarlo, lo
correcto es una cuenta con su propio alcance y no reutilizar la del Administrador de Unidad.

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
├── Models/                    Vehicle · UnitPeriod · User · InvestorLead · DriverApplication
├── Policies/VehiclePolicy.php Reglas de acceso por rol
├── Services/                  UnitPerformanceCalculator (indicadores de rendimiento)
├── Http/Controllers/Api/      Auth · Vehicle · Landing · Lead · Performance
├── Http/Requests/             Validación de entrada (Form Requests)
└── Http/Resources/            Vehicle · User (contrato snake_case)
config/drivemid.php            Identidad, contenido del sitio y cuentas de demostración
database/
├── migrations/                vehicles · unit_periods · users(+rol y unidad) · investor_leads · tokens
├── seeders/                   VehicleSeeder · UserSeeder · UnitPeriodSeeder
└── factories/                 Factories para pruebas
routes/api.php                 Endpoints públicos y protegidos
tests/Feature/                 AuthApiTest · FleetApiTest · LandingApiTest · PerformanceApiTest (45 pruebas)
```

El seeder carga la unidad real del cliente —Chevrolet Aveo 2022, placas YXY-669-G— con los
datos de conductor, póliza y kilometraje todavía de ejemplo. El seguimiento de esa unidad es
un enlace externo (`vehicles.tracking_url`): el cliente rastrea con un link por vehículo, no
con una API, así que el enlace real no se versiona y el seeder usa un marcador.

`UnitPeriodSeeder` carga además **doce cortes semanales de ejemplo** marcados con
`source = 'demo'`, y las condiciones económicas de la unidad llevan `financials_are_demo = true`.
El cliente aportó la identidad del vehículo y la referencia de 412 km semanales; el kilometraje y
los días de cada corte, junto con los importes de renta, costos y reserva, son de demostración
hasta que entregue los suyos. El panel y el reporte lo advierten en pantalla, y los indicadores
pasan a ser reales en cuanto se capturen los primeros cortes propios.
