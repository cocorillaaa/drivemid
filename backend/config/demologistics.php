<?php

use App\Models\Vehicle;

return [

    /*
    |--------------------------------------------------------------------------
    | Identidad de la marca
    |--------------------------------------------------------------------------
    */

    'brand' => [
        'name' => 'DemoLogistics',
        'tagline' => 'Prototipo de demostración',
        'legal_name' => 'DemoLogistics · Prototipo de demostración',
    ],

    /*
    |--------------------------------------------------------------------------
    | Contenido comercial de la landing pública
    |--------------------------------------------------------------------------
    |
    | Se sirve desde `/api/public/overview` para que el frontend no mantenga
    | contenido duplicado. Editar aquí no requiere recompilar Angular.
    |
    */

    'solutions' => [
        [
            'key' => 'corporate-transport',
            'title' => 'Transporte corporativo',
            'description' => 'Traslado diario de colaboradores y personal directivo con unidades asignadas, conductores verificados y control de horarios por centro de costo.',
            'bullets' => ['Unidad dedicada', 'Facturación mensual', 'Reporte por centro de costo'],
        ],
        [
            'key' => 'executive-transfer',
            'title' => 'Traslado ejecutivo',
            'description' => 'Servicio puerta a puerta para juntas, aeropuerto y visitas de cliente con estándar de puntualidad y confidencialidad.',
            'bullets' => ['SLA de puntualidad', 'Conductor bilingüe', 'Discreción total'],
        ],
        [
            'key' => 'fleet-management',
            'title' => 'Gestión integral de flota',
            'description' => 'Administración de unidades propias o arrendadas: pólizas, mantenimiento preventivo, telemetría y asignación de conductores.',
            'bullets' => ['Alertas de pólizas', 'Mantenimiento preventivo', 'Telemetría GPS'],
        ],
        [
            'key' => 'groups-events',
            'title' => 'Grupos y eventos',
            'description' => 'Cobertura para convenciones, roadshows y logística de eventos con unidades de mayor capacidad y coordinación en sitio.',
            'bullets' => ['Unidades de 7 plazas', 'Coordinador en sitio', 'Cobertura nacional'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Catálogos del formulario de captación
    |--------------------------------------------------------------------------
    */

    'service_types' => [
        'Transporte corporativo',
        'Traslado ejecutivo',
        'Gestión integral de flota',
        'Grupos y eventos',
    ],

    'cities' => [
        'Ciudad de México',
        'Estado de México',
        'Guadalajara, Jalisco',
        'Monterrey, Nuevo León',
        'Puebla, Puebla',
        'Querétaro, Querétaro',
        'Tijuana, Baja California',
    ],

    /*
    |--------------------------------------------------------------------------
    | Canales de contacto institucionales
    |--------------------------------------------------------------------------
    */

    'contact' => [
        'phone' => '55 5580 1234',
        'phone_link' => '+525555801234',
        'email' => 'contacto@demologistics.mx',
        'address' => 'Av. Paseo de la Reforma 505, piso 32 · Cuauhtémoc, 06500, Ciudad de México',
        'hours' => 'Lunes a viernes 08:00 – 19:00 · Operación 24/7',
    ],

    /*
    |--------------------------------------------------------------------------
    | Indicadores institucionales que no dependen de la flota
    |--------------------------------------------------------------------------
    */

    'static_metrics' => [
        [
            'value' => '24/7',
            'label' => 'Monitoreo GPS y asistencia vial',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cuentas de demostración
    |--------------------------------------------------------------------------
    |
    | Fuente única de las credenciales del prototipo: las usa `UserSeeder`
    | para crear los usuarios y `LandingController` para mostrarlas en la
    | pantalla de acceso. Sólo se exponen cuando APP_DEBUG está activo, de
    | modo que en un entorno real quedan ocultas.
    |
    */

    'demo_accounts' => [
        [
            'name' => 'Alejandra Fuentes Ríos',
            'email' => 'superadmin@demologistics.mx',
            'password' => 'admin1234',
            'role' => 'superuser',
            'vehicle_id' => null,
            'job_title' => 'Dirección de Operaciones',
            'phone' => '5555801200',
            'scope' => 'Vista global de la flota',
        ],
        [
            'name' => 'Juan Carlos Ramírez Ortega',
            'email' => 'unidad01@demologistics.mx',
            'password' => 'unidad123',
            'role' => 'unit_admin',
            'vehicle_id' => 'unit-01',
            'job_title' => 'Administrador de Unidad 01 · Conductor asignado',
            'phone' => '5548217390',
            'scope' => 'Unidad 01 · ABC-123',
        ],
        [
            'name' => 'Miguel Ángel Hernández Cruz',
            'email' => 'unidad02@demologistics.mx',
            'password' => 'unidad123',
            'role' => 'unit_admin',
            'vehicle_id' => 'unit-02',
            'job_title' => 'Administrador de Unidad 02 · Conductor asignado',
            'phone' => '5591372648',
            'scope' => 'Unidad 02 · DFG-456',
        ],
        [
            'name' => 'Luis Fernando Mendoza Ríos',
            'email' => 'unidad03@demologistics.mx',
            'password' => 'unidad123',
            'role' => 'unit_admin',
            'vehicle_id' => 'unit-03',
            'job_title' => 'Administrador de Unidad 03 · Conductor asignado',
            'phone' => '8120458891',
            'scope' => 'Unidad 03 · HIJ-789',
        ],
        [
            'name' => 'Ricardo Alejandro Domínguez Peña',
            'email' => 'unidad04@demologistics.mx',
            'password' => 'unidad123',
            'role' => 'unit_admin',
            'vehicle_id' => 'unit-04',
            'job_title' => 'Administrador de Unidad 04 · Conductor asignado',
            'phone' => '3367124405',
            'scope' => 'Unidad 04 · KLM-012',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reglas de operación
    |--------------------------------------------------------------------------
    */

    'policy_warning_days' => Vehicle::POLICY_WARNING_DAYS,

];
