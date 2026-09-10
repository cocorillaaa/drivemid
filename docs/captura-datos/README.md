# Captura de datos reales

Material para pasar la plataforma de datos de prueba a datos reales del cliente.

| Archivo | Para qué |
|---|---|
| `DemoLogistics_plantilla_datos.xlsx` | Libro que se envía al cliente para que capture su flota |

## Contenido del libro

| Pestaña | Qué recoge |
|---|---|
| **Instrucciones** | Cómo llenarlo, qué no hace falta enviar, cómo se entrega el seguimiento GPS y los assets |
| **1. Unidades** | Una fila por vehículo: datos del coche, del conductor, de la póliza, kilometrajes y link de seguimiento |
| **2. Usuarios** | Quién entra al sistema, con qué rol y qué unidad administra |
| **3. Contenido** | Teléfonos, direcciones, ciudades, zonas de cobertura y textos del sitio público |
| **Catálogos** | Listas que alimentan los desplegables de las hojas 1 y 2 |

Cada encabezado lleva un comentario con la indicación del campo, la fila 3 es un ejemplo en
amarillo que debe borrarse antes de enviar, y hay 40 filas formateadas listas para capturar.

## Correspondencia con la base de datos

Las columnas de la hoja **1. Unidades** se cargan directamente en las tablas `vehicles` y `users`
(esta última para los datos del conductor). Estos campos **no** se piden porque el sistema los
deriva:

| Campo derivado | Origen |
|---|---|
| `policy_status` | Se calcula desde `policy_valid_to` con el umbral de `policy_warning_days` |
| `policy_days_to_expire` | Igual que el anterior |
| `weekly_km_by_day` | Se reparte desde `weekly_km` conservando la forma de la serie |

## Seguimiento GPS

El cliente rastrea sus unidades por Bluetooth y consulta la posición con **un link por unidad**, no
con una API. Por eso la hoja **1. Unidades** cierra con dos columnas:

- **Link de seguimiento (GPS)** — la URL de cada unidad; si es la misma para toda la flota se deja
  sólo en la primera fila y se anota en `Notas`.
- **Notas** — aclaraciones sobre la unidad, su documentación o su seguimiento.

Un link da acceso directo al seguimiento, pero no alimenta la telemetría de la plataforma. Estos
campos siguen sin fuente real mientras no exista una API o un export del proveedor:

`location_label` · `location_zone` · `location_lat` · `location_lng` ·
`location_updated_at` · `speed_kmh` · `heading` · `fuel_level`

La columna `tracking_url` **no existe todavía** en la tabla `vehicles`: guardar el link por unidad
implica una migración y un acceso en la interfaz, que aún no están implementados.

## Regenerar la plantilla

Si cambia el esquema de `vehicles`, hay que actualizar el libro. Las columnas de la hoja
**1. Unidades** están declaradas en la lista `columnas` del generador, en el mismo orden que el
formulario de la plataforma.
