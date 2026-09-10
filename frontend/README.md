# Vanguard Fleet · Frontend

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
├── core/                  Modelos, datos mock, servicios (Signals), guard de rol
├── shared/components/     toast-host · stat-card · fleet-map · unit-detail-modal
└── features/
    ├── landing/           Landing pública (header, hero, soluciones, flota, captación, footer)
    └── platform/          Shell + selector de roles + dashboards
```

## Rutas

| Ruta | Vista |
|---|---|
| `/` | Landing pública con formulario de captación |
| `/plataforma/flota` | Dashboard de Superusuario (vista global) |
| `/plataforma/unidad` | Dashboard de Administrador de Unidad (una unidad) |

## Configuración

La URL de la API se define en `src/environments/environment.ts`
(por defecto `http://127.0.0.1:8001/api`). Si la API no responde, la aplicación usa el
dataset mock local de `core/data/fleet-mock.data.ts` y lo indica en la barra superior.
