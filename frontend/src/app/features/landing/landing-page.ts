import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LandingService } from '../../core/services/landing.service';
import { FleetPreviewComponent } from './components/fleet-preview/fleet-preview';
import { HeroComponent } from './components/hero/hero';
import { LeadFormComponent } from './components/lead-form/lead-form';
import { SiteFooterComponent } from './components/site-footer/site-footer';
import { SiteHeaderComponent } from './components/site-header/site-header';
import { SolutionsComponent } from './components/solutions/solutions';

/**
 * Landing pública de Vanguard Fleet.
 *
 * Todo el contenido (soluciones, catálogos, contacto, indicadores y la flota
 * publicada) proviene de `/api/public/overview`: el frontend sólo se encarga
 * de la presentación.
 */
@Component({
  selector: 'vf-landing-page',
  imports: [
    SiteHeaderComponent,
    HeroComponent,
    SolutionsComponent,
    FleetPreviewComponent,
    LeadFormComponent,
    SiteFooterComponent,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  private readonly landing = inject(LandingService);

  constructor() {
    this.landing.ensureLoaded();
  }
}
