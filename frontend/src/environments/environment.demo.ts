/**
 * Configuración de entorno para la demo publicada.
 *
 * A diferencia del entorno local, aquí la API **no** se llama por su dirección
 * absoluta: el frontend pide `/api` sobre su propio origen y el servidor de
 * desarrollo reenvía esa ruta a Laravel (`proxy.demo.json`).
 *
 * Esa decisión resuelve dos problemas de golpe: el cliente recibe un solo
 * enlace en lugar de dos, y no hace falta abrir CORS a un dominio de túnel que
 * cambia cada vez que se levanta.
 */
export const environment = {
  production: false,
  appName: 'Drive Mid',
  /** Base de la API REST, relativa al origen que sirve la aplicación. */
  apiBaseUrl: '/api',
  /** Tiempo máximo de espera de una petición (ms). */
  apiTimeoutMs: 12_000,
  /** Intervalo de refresco automático de la telemetría (ms). */
  telemetryRefreshMs: 30_000,
} as const;

export type Environment = typeof environment;
