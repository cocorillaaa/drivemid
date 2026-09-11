/**
 * Configuración de entorno (demo / prototipo).
 *
 * El frontend consume la API de Laravel expuesta en el puerto 8001.
 * Todos los datos provienen del backend: no hay datasets locales.
 */
export const environment = {
  production: false,
  appName: 'Drive Mid',
  /** Base de la API REST (Laravel). */
  apiBaseUrl: 'http://127.0.0.1:8001/api',
  /** Tiempo máximo de espera de una petición (ms). */
  apiTimeoutMs: 12_000,
  /** Intervalo de refresco automático de la telemetría (ms). */
  telemetryRefreshMs: 30_000,
} as const;

export type Environment = typeof environment;
