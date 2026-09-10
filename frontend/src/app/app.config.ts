import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

/**
 * Configuración raíz de la aplicación (standalone + zoneless).
 *
 * - `provideRouter` habilita la navegación entre la landing pública, el
 *   acceso y la plataforma, restaurando la posición de scroll al cambiar de
 *   ruta.
 * - `provideHttpClient` conecta con la API de Laravel (puerto 8001) y añade el
 *   interceptor que adjunta el token Bearer y normaliza las respuestas.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
