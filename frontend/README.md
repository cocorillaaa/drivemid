# DemoLogistics · Frontend

Aplicación Angular 22 (standalone, zoneless, Signals) para la plataforma ejecutiva de
gestión de flota. La documentación completa del proyecto está en el
[README raíz](../README.md).

```bash
npm install
npx ng serve --port 4201 --host 127.0.0.1   # http://localhost:4201
npx ng build                                 # build de producción → dist/frontend
npx ng test --watch=false                    # pruebas unitarias (vitest)
```

## Estructura

```
src/app/
├── core/                  Modelos, servicios (Signals), guards, interceptor y mappers
├── shared/components/     toast-host · stat-card · fleet-map · unit-detail-modal
└── features/
    ├── auth/              Pantalla de acceso
    ├── landing/           Landing pública (header, hero, soluciones, flota, captación, footer)
    └── platform/          Shell con la sesión + dashboards por rol
```

## Rutas

| Ruta | Vista |
|---|---|
| `/` | Landing pública con formulario de captación |
| `/acceso` | Pantalla de credenciales (Laravel Sanctum) |
| `/plataforma/flota` | Panel de flota · Superusuario (vista global) |
| `/plataforma/unidad` | Mi unidad · Administrador de Unidad (sólo la asignada) |

## Sesión

El rol y la unidad asignada provienen de `GET /api/auth/me`; el cliente nunca los decide.
`authGuard` exige sesión, `roleGuard` mantiene la URL alineada con el rol y
`authInterceptor` adjunta el token `Bearer`, fuerza `Accept: application/json` y cierra la
sesión ante un `401`.

Credenciales del seeder: `superadmin@demologistics.mx` / `admin1234` y
`unidad0N@demologistics.mx` / `unidad123` (N = 1…4).

## Configuración

La URL de la API y los intervalos de refresco se definen en
`src/environments/environment.ts` (`apiBaseUrl` → `http://127.0.0.1:8001/api`,
`telemetryRefreshMs` → 30 s). Todos los datos provienen del backend: no hay datasets
locales.
