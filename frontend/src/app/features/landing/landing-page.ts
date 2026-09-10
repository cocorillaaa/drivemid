import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FleetService } from '../../core/services/fleet.service';
import { FleetPreviewComponent } from './components/fleet-preview/fleet-preview';
import { HeroComponent } from './components/hero/hero';
import { LeadFormComponent } from './components/lead-form/lead-form';
import { SiteFooterComponent } from './components/site-footer/site-footer';
import { SiteHeaderComponent } from './components/site-header/site-header';
import { SolutionsComponent } from './components/solutions/solutions';

/**
 * Landing pública de Vanguard Fleet.
 *
 * Compone las secciones de marketing y captación. Al inicializar solicita
 * la flota al servicio (de forma silenciosa) para que el panel en vivo del
 * hero y el mapa muestren datos reales sin interrumpir al visitante.
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
  private readonly fleet = inject(FleetService);

  constructor() {
    this.fleet.ensureLoaded({ silent: true });
  }
}
