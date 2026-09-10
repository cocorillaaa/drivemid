/**
 * Configuración de entorno (demo / prototipo).
 *
 * El frontend consume la API de Laravel expuesta en el puerto 8001.
 * Si la API no responde, `FleetService` degrada automáticamente al
 * dataset mock local para que la demo nunca se quede en blanco.
 */
export const environment = {
  production: false,
  appName: 'Vanguard Fleet',
  /** Base de la API REST (Laravel). */
  apiBaseUrl: 'http://127.0.0.1:8001/api',
  /** Tiempo máximo de espera contra la API antes de usar el mock local (ms). */
  apiTimeoutMs: 4000,
  /** Refresco simulado de telemetría de la flota (ms). */
  telemetryRefreshMs: 45000,
} as const;

export type Environment = typeof environment;
