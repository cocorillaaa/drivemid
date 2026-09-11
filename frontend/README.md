# Drive Mid · Frontend

Aplicación Angular 22 (standalone, zoneless, Signals) del sistema del programa de inversión
en movilidad: el sitio público que presenta el programa y la plataforma que administra las
unidades. La documentación completa del proyecto está en el [README raíz](../README.md).

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
├── shared/components/     toast-host · stat-card · fleet-map · ficha técnica · contacto
└── features/
    ├── auth/              Pantalla de acceso
    ├── landing/           Sitio público (portada, quiénes somos, modelo, plan, públicos, contacto)
    └── platform/          Shell con la sesión + dashboards por rol
        ├── superuser-dashboard/   Panel de flota + panel de rendimiento
        ├── performance-report/    Reporte de rendimiento imprimible
        └── unit-admin-dashboard/  Vista de la unidad asignada
```

## Rutas

| Ruta | Vista |
|---|---|
| `/` | Sitio público del programa, con los formularios de captación |
| `/acceso` | Pantalla de credenciales (Laravel Sanctum) |
| `/plataforma/flota` | Panel de flota y rendimiento · Superusuario (vista global) |
| `/plataforma/rendimiento/:id` | Reporte de rendimiento de una unidad · Superusuario |
| `/plataforma/unidad` | Mi unidad · Administrador de Unidad (sólo la asignada) |

## Sesión

El rol y la unidad asignada provienen de `GET /api/auth/me`; el cliente nunca los decide.
`authGuard` exige sesión, `roleGuard` mantiene la URL alineada con el rol y
`authInterceptor` adjunta el token `Bearer`, fuerza `Accept: application/json` y cierra la
sesión ante un `401`.

Credenciales del seeder: `superadmin@drivemid.com` / `admin1234` y
`unidad01@drivemid.com` / `unidad123`.

## Rendimiento

El panel de rendimiento sale de los cortes semanales que el backend guarda en
`unit_periods`, no de una foto del estado actual: por eso puede calcular
utilización, flujo neto, días fuera de servicio, mora y costo por kilómetro. El
reporte de `/plataforma/rendimiento/:id` está pensado para imprimirse o
guardarse en PDF y entregarse a un inversionista; sus estilos de impresión
retiran la barra de sesión, la navegación y los avisos, y evitan que las
tarjetas se recorten entre páginas.

Tanto el panel como el reporte advierten en pantalla cuando las cifras son de
ejemplo: la bandera se calcula sobre el dato, de modo que basta con que los
importes del contrato o los cortes provengan del sembrado para que el aviso
aparezca.

## Identidad gráfica

La base neutra del sistema de diseño (`src/styles.scss`) lleva encima la identidad del
cliente: azul marino `#1b232f` y dorado `#c6a654`, tomados de su logotipo. El logotipo se
extrajo de la maqueta que entregó el cliente y vive en `public/images/` en dos variantes,
el distintivo completo (`logo-drivemid.png`) y la versión dorada sin círculo
(`logo-drivemid-oro.png`) para fondos oscuros.

El **icono de la pestaña** (`public/favicon-16.png`, `-32` y `-48`) usa sólo el monograma
sobre el azul del distintivo: a ese tamaño el nombre «DRIVE MID» del logotipo completo
resulta ilegible. El icono táctil de iOS (`apple-touch-icon.png`, 180 px) sí lleva el
distintivo entero, donde el nombre se lee.

## Configuración

La URL de la API y los intervalos de refresco se definen en
`src/environments/environment.ts` (`apiBaseUrl` → `http://127.0.0.1:8001/api`,
`telemetryRefreshMs` → 30 s). Todos los datos provienen del backend: no hay datasets
locales.
