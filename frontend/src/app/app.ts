import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastHostComponent } from './shared/components/toast-host/toast-host';

/**
 * Componente raíz de DemoLogistics.
 *
 * Sólo hospeda el `router-outlet` (landing pública o plataforma) y el
 * contenedor global de notificaciones.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
