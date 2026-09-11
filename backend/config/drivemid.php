<?php

use App\Models\Vehicle;

return [

    /*
    |--------------------------------------------------------------------------
    | Identidad de la marca
    |--------------------------------------------------------------------------
    |
    | El prototipo trabaja con la identidad del cliente. `demo` se muestra como
    | distintivo para no confundir esta maqueta con el sistema en producción.
    |
    */

    'brand' => [
        'name' => 'Drive Mid',
        'short_name' => 'Drive Mid',
        'tagline' => 'Inversión en movilidad',
        'legal_name' => 'Drive Mid · Prototipo de demostración',
        'demo_badge' => 'Demo',
    ],

    /*
    |--------------------------------------------------------------------------
    | Contenido del sitio público
    |--------------------------------------------------------------------------
    |
    | Se sirve desde `/api/public/overview` para que el frontend no mantenga
    | contenido duplicado. Editar aquí no requiere recompilar Angular.
    |
    | El negocio no se presenta como arrendadora: se presenta como un programa
    | de inversión que capitaliza una operación de movilidad. El contenido está
    | redactado a partir de la información que entregó el cliente.
    |
    */

    'about' => [
        'title' => 'Quiénes somos',
        'body' => [
            'Somos un equipo especializado en la gestión y administración estratégica de recursos, enfocado en generar rendimientos estables y sostenibles para nuestros socios e inversionistas.',
            'Captamos capital e invertimos directamente en el sector de movilidad en Mérida. El capital se convierte en unidades que operan, se monitorean y se auditan una por una.',
        ],
    ],

    'mission' => [
        'title' => 'Misión',
        'body' => 'Optimizar procesos y dar un seguimiento riguroso a cada operación para garantizar su éxito, impulsando así el crecimiento financiero de nuestros aliados comerciales.',
    ],

    'vision' => [
        'title' => 'Visión',
        'body' => 'Posicionarnos como el fondo de gestión e inversión en movilidad líder en la región, reconocidos por la transparencia de nuestras operaciones, la innovación operativa y el impacto positivo en la comunidad.',
    ],

    'values' => [
        [
            'key' => 'compromiso',
            'title' => 'Compromiso',
            'description' => 'Dedicación total en la gestión y cumplimiento de objetivos.',
        ],
        [
            'key' => 'responsabilidad',
            'title' => 'Responsabilidad',
            'description' => 'Manejo ético y riguroso del capital depositado.',
        ],
        [
            'key' => 'puntualidad',
            'title' => 'Puntualidad',
            'description' => 'Eficiencia en los tiempos de entrega y retornos.',
        ],
        [
            'key' => 'transparencia',
            'title' => 'Transparencia',
            'description' => 'Claridad absoluta en cada etapa del proceso.',
        ],
    ],

    'business_model' => [
        'title' => 'Modelo de negocio',
        'body' => [
            'Captamos capital a través de una red estratégica de referencias e invertimos directamente en el sector de movilidad en la ciudad de Mérida. Este esquema genera un ecosistema de valor que beneficia simultáneamente a nuestros socios, empresas aliadas y a la comunidad en general.',
            'Nuestros procesos operativos están diseñados para maximizar la eficiencia, detectar áreas de oportunidad en tiempo real y acelerar el retorno a corto plazo. Respaldamos esta gestión con tecnología de monitoreo, permitiendo a nuestros socios auditar cada parámetro de la operación con total certeza y confianza.',
        ],
        'flow' => [
            [
                'key' => 'capital',
                'title' => 'Capital',
                'description' => 'Los socios aportan el capital de cada unidad a través de la red de referencias.',
            ],
            [
                'key' => 'unidad',
                'title' => 'Unidad',
                'description' => 'El capital se convierte en una unidad revisada, asegurada y dada de alta.',
            ],
            [
                'key' => 'operacion',
                'title' => 'Operación',
                'description' => 'La unidad trabaja con un conductor validado y reglas de uso por escrito.',
            ],
            [
                'key' => 'retorno',
                'title' => 'Retorno',
                'description' => 'La operación genera flujo, se cubren reservas y se distribuye el rendimiento.',
            ],
        ],
    ],

    'work_plan' => [
        'title' => 'Plan de trabajo',
        'intro' => 'Cada etapa se ejecuta y se mide antes de pasar a la siguiente. El piloto se documenta con datos propios de la operación, no con proyecciones.',
        'steps' => [
            [
                'key' => 'captacion',
                'step' => '01',
                'title' => 'Captación de capital',
                'description' => 'Integramos el capital por unidad: vehículo, adecuación y trámites, equipo de monitoreo, seguro y reserva de mantenimiento.',
            ],
            [
                'key' => 'adquisicion',
                'step' => '02',
                'title' => 'Adquisición y revisión de la unidad',
                'description' => 'Compra con factura y cadena de propiedad, verificación REPUVE, diagnóstico mecánico, prueba dinámica y valuación de salida.',
            ],
            [
                'key' => 'conductor',
                'step' => '03',
                'title' => 'Selección del conductor',
                'description' => 'Entrevista estructurada, referencias, validación de licencia y comprobación de capacidad de pago. Contrato de prueba con depósito en garantía.',
            ],
            [
                'key' => 'operacion',
                'step' => '04',
                'title' => 'Operación y control',
                'description' => 'Monitoreo de la unidad, kilometraje, mantenimiento programado, cobranza y expediente digital por vehículo y por conductor.',
            ],
            [
                'key' => 'medicion',
                'step' => '05',
                'title' => 'Medición del piloto',
                'description' => 'Durante los primeros meses se registran utilización, ingreso neto por día, días fuera de servicio, siniestros y rotación de conductores.',
            ],
            [
                'key' => 'escalamiento',
                'step' => '06',
                'title' => 'Escalamiento',
                'description' => 'Con el piloto medido y auditado se incorpora capital adicional y se suman unidades al programa.',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | A quién se dirige el programa
    |--------------------------------------------------------------------------
    */

    'audiences' => [
        [
            'key' => 'investor',
            'title' => 'Inversionistas',
            'description' => 'Participa en una operación de movilidad con activo identificable, controles, reportes periódicos y reservas de riesgo.',
            'bullets' => [
                'Activo identificable por número de serie',
                'Reporte periódico por unidad',
                'Reserva de riesgo y depósito en garantía',
                'Rendimiento sujeto al desempeño de la operación',
            ],
        ],
        [
            'key' => 'driver',
            'title' => 'Conductores',
            'description' => 'Trabaja con una unidad confiable y soporte cuando lo necesites, con reglas transparentes y mantenimiento programado.',
            'bullets' => [
                'Unidad asegurada y con mantenimiento al día',
                'Pagos semanales y reglas por escrito',
                'Contrato de prueba inicial',
                'Acompañamiento en el alta de la plataforma',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Catálogos del formulario de captación
    |--------------------------------------------------------------------------
    */

    'capital_ranges' => [
        'Una unidad',
        'Dos a cuatro unidades',
        'Cinco unidades o más',
        'Por definir',
    ],

    /*
    |--------------------------------------------------------------------------
    | Canales de contacto institucionales
    |--------------------------------------------------------------------------
    */

    'contact' => [
        'phone' => '9991112819',
        'email' => 'info@drivemid.com',
        'address' => 'Plaza San Juan Bautista Local 11, Gran Santa Fe Norte · Mérida, Yucatán',
        'city' => 'Mérida, Yucatán',
        'hours' => 'Lunes a viernes 09:00 – 18:00',
        'website' => 'www.drivemid.com',
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
            'email' => 'superadmin@drivemid.com',
            'password' => 'admin1234',
            'role' => 'superuser',
            'vehicle_id' => null,
            'job_title' => 'Dirección de Operaciones',
            'phone' => '9991112819',
            'scope' => 'Vista global de la flota',
        ],
        [
            'name' => 'Juan Carlos Ramírez Ortega',
            'email' => 'unidad01@drivemid.com',
            'password' => 'unidad123',
            'role' => 'unit_admin',
            'vehicle_id' => 'unit-01',
            'job_title' => 'Administrador de Unidad 01 · Conductor asignado',
            'phone' => '5548217390',
            'scope' => 'Unidad 01 · YXY-669-G',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reglas de operación
    |--------------------------------------------------------------------------
    */

    'policy_warning_days' => Vehicle::POLICY_WARNING_DAYS,

];
