# Captura de datos reales

Material para pasar la plataforma de datos de ejemplo a datos reales del cliente.

| Archivo | Para qué | Estado |
|---|---|---|
| `plantilla sistema.xlsx` | Captura la unidad y confirma los datos de contacto | Enviado y devuelto por el cliente |
| `plantilla datos completos.xlsx` | Pide lo que quedó pendiente para que el sistema deje de estimar | Listo para enviar |

## `plantilla datos completos.xlsx`

El segundo libro existe por una razón concreta: el sistema ya funciona con la unidad real del
cliente, pero los indicadores de inversionista —retorno, flujo neto, utilización, costo por
kilómetro— se calculan con cifras de ejemplo, porque no hay ninguna cifra financiera suya. Este
libro pide exactamente eso, y nada más.

| Pestaña | Qué recoge | ¿Indispensable? |
|---|---|---|
| **Instrucciones** | Por qué otra hoja, cómo llenarla y de dónde sale cada dato | — |
| **1. Unidad** | Lo que falta del auto: VIN y kilometrajes | Sí, el VIN |
| **2. Dinero del contrato** | Capital invertido, renta semanal, reserva, depósito, costos fijos mensuales y fecha de alta, una fila por unidad | Sí |
| **3. Cortes semanales** | Trece semanas de operación: km, días en servicio y en taller, ingreso facturado y cobrado, costos y conductor | Sí |
| **4. Póliza y conductor** | Lo que hoy se muestra como ejemplo en la ficha de la unidad | Opcional |
| **5. Accesos y pendientes** | Quién entra a la plataforma y lo que no cabe en una hoja (logotipo vectorial, avisos legales) | Opcional |

**Cómo se corresponde con el esquema**: la pestaña 2 llena las columnas económicas de `vehicles`
(`capital_invested`, `weekly_fee`, `maintenance_reserve`, `security_deposit`,
`monthly_insurance_cost`, `monthly_tracking_cost`, `monthly_admin_cost`, `acquired_on`); la
pestaña 3 llena `unit_periods`, que es la única fuente de histórico del sistema; la pestaña 4
llena los campos de póliza y conductor de `vehicles`.

La pestaña **3. Cortes semanales** trae las trece fechas ya puestas (los lunes del trimestre), una
fila de totales con fórmulas y formato condicional que pinta en verde cuando los días en servicio
y en taller suman siete, y en rojo cuando no: así el cliente detecta un error de captura sin
llamarnos. Se le ofrece además la salida de mandar los estados de cuenta y los reportes de la
plataforma para que los vaciemos nosotros.

**Regenerarlo**: igual que el primer libro, el generador vive fuera del repositorio, en
`/tmp/gen-plantilla3.py`.

## Contenido del libro anterior

| Pestaña | Qué recoge |
|---|---|
| **Instrucciones** | Qué es, cómo llenarla, qué no hace falta enviar, cómo se entrega el seguimiento GPS y qué falta del logotipo |
| **1. Unidad** | Una sola sección por auto: identificación, estatus, kilometrajes y link de seguimiento |
| **2. Contacto** | Los datos públicos del programa, para confirmar o corregir |

El libro quedó reducido a **tres pestañas** porque el cliente pidió expresamente que sólo se le
pidieran datos del auto más el link de seguimiento. Ya no hay pestañas de usuarios, conductores,
póliza ni catálogos.

La pestaña **1. Unidad** se llena por renglones —campo, valor y una ayuda a la derecha—, no por
columnas: cada dato va en su fila. El estatus se elige de una lista desplegable y se pinta en
verde («Operativo») o en rojo («No operativo») con formato condicional. Para dar de alta otra
unidad se copia la sección completa debajo de la primera.

El libro **no lleva la marca por ningún lado**: ni en el nombre del archivo ni dentro de las
pestañas.

## Correspondencia con la base de datos

| Dato del libro | Destino |
|---|---|
| Marca · Modelo · Año | `vehicles.make` · `vehicles.model` · `vehicles.year` |
| Placas | `vehicles.plates` (único) |
| VIN / N° de serie | `vehicles.vin` (único) |
| Color | `vehicles.color` |
| Capacidad | `vehicles.capacity` |
| Estatus (Operativo / No operativo) | `vehicles.status` (`en_servicio`, `disponible`, `mantenimiento`) |
| Odómetro actual | `vehicles.odometer_km` |
| Km de la semana | `vehicles.weekly_km` |
| Link de seguimiento (GPS) | `vehicles.tracking_url` |
| Notas | Se resuelve al cargar; no tiene columna propia |
| Teléfono · correo · dirección · horario · sitio web | `config/drivemid.php`, bloque `contact` |

El **tipo de servicio** no se pide: todas las unidades del programa operan en plataformas de
movilidad.

Estos campos **no** se piden porque el sistema los deriva:

| Campo derivado | Origen |
|---|---|
| `policy_status` | Se calcula desde `policy_valid_to` con el umbral de `policy_warning_days` (60 días) |
| `policy_days_to_expire` | Igual que el anterior |
| `weekly_km_by_day` | Se reparte desde `weekly_km` conservando la forma de la serie |

## Seguimiento GPS

El cliente rastrea sus unidades por Bluetooth y consulta la posición con **un link por unidad**,
no con una API. Ese enlace se guarda en la columna `tracking_url` de `vehicles`, `VehicleResource`
lo expone y la interfaz ofrece tres accesos directos: el botón **Seguimiento** en la tabla del
panel de flota, el bloque **Seguimiento GPS** en la ficha técnica y **Abrir seguimiento GPS** en
la vista de unidad.

El enlace real **no se versiona**, porque da acceso a la ubicación del vehículo: tanto el seeder
como la hoja de captura usan el marcador `https://seguimiento.ejemplo.mx/u/YXY669G`.

Un enlace da acceso directo al seguimiento del proveedor, pero **no alimenta la telemetría de la
plataforma**. Estos campos siguen sin fuente real mientras no exista una API o un export de
posiciones:

`location_label` · `location_zone` · `location_lat` · `location_lng` ·
`location_updated_at` · `speed_kmh` · `heading` · `fuel_level`

## Estado de la captura

| Dato | Situación |
|---|---|
| Marca, modelo, año, placas, color y capacidad | Capturados por el cliente · Chevrolet Aveo 2022 · YXY-669-G · gris · 5 pasajeros |
| Estatus | Capturado como «Operativo»; quedó en `en_servicio` |
| VIN | **Pendiente**: es el único campo en blanco del libro |
| Odómetro (68 450 km) y km de la semana (412) | Precargados como ejemplo: conviene que el cliente los confirme o corrija |
| Link de seguimiento | El enlace real está cargado en la base local (no se versiona); el libro y el seeder conservan el marcador |
| Datos de contacto | Ya publicados en el sitio sin confirmar; la pestaña «2. Contacto» es para validarlos |
| Logotipo vectorial (SVG, AI o EPS) | Pendiente de que lo entregue el cliente |

## Regenerar la plantilla

El generador del libro **no vive en el repositorio**: es el script `/tmp/gen-plantilla2.py`, fuera
del proyecto, y no se versiona. Si hay que rehacer la hoja —porque cambie el esquema de
`vehicles` o porque el cliente pida otra cosa— hay que editar ese script o reconstruir el libro a
mano. Este documento no apunta a ningún archivo del repositorio porque no existe.
