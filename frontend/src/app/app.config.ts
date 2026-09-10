import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

/**
 * Configuración raíz de la aplicación (standalone + zoneless).
 *
 * - `provideRouter` habilita la navegación entre la landing pública y la
 *   plataforma, restaurando la posición de scroll al cambiar de ruta.
 * - `provideHttpClient(withFetch)` habilita la comunicación con la API de
 *   Laravel expuesta en el puerto 8001.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withFetch()),
  ],
};
