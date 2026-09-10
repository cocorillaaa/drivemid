# Captura de datos reales

Material para pasar la plataforma de datos de prueba a datos reales del cliente.

| Archivo | Para qué |
|---|---|
| `DemoLogistics_plantilla_datos.xlsx` | Libro que se envía al cliente para que capture su flota |

## Contenido del libro

| Pestaña | Qué recoge |
|---|---|
| **Instrucciones** | Cómo llenarlo, qué no hace falta enviar y las preguntas de GPS y assets |
| **1. Unidades** | Una fila por vehículo: datos del coche, del conductor, de la póliza y kilometrajes |
| **2. Usuarios** | Quién entra al sistema, con qué rol y qué unidad administra |
| **3. Contenido** | Teléfonos, direcciones, ciudades, zonas de cobertura y textos del sitio público |
| **Catálogos** | Listas que alimentan los desplegables de las hojas 1 y 2 |

Cada encabezado lleva un comentario con la indicación del campo, la fila 3 es un ejemplo en
amarillo que debe borrarse antes de enviar, y hay 40 filas formateadas listas para capturar.

## Correspondencia con la base de datos

Las columnas de la hoja **1. Unidades** se cargan directamente en las tablas `vehicles` y
`users` (esta última para los datos del conductor). Estos campos **no** se piden porque el
sistema los deriva:

| Campo derivado | Origen |
|---|---|
| `policy_status` | Se calcula desde `policy_valid_to` con el umbral de `policy_warning_days` |
| `policy_days_to_expire` | Igual que el anterior |
| `weekly_km_by_day` | Se reparte desde `weekly_km` conservando la forma de la serie |

Y estos provienen de telemetría, no de captura manual:

`location_label` · `location_zone` · `location_lat` · `location_lng` ·
`location_updated_at` · `speed_kmh` · `heading` · `fuel_level`

## Regenerar la plantilla

Si cambia el esquema de `vehicles`, hay que actualizar el libro. Las columnas de la hoja
**1. Unidades** están declaradas en la lista `columnas` del generador, en el mismo orden que el
formulario de la plataforma.
