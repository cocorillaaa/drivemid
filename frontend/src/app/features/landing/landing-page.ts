import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LandingService } from '../../core/services/landing.service';
import { AboutComponent } from './components/about/about';
import { AudiencesComponent } from './components/audiences/audiences';
import { HeroComponent } from './components/hero/hero';
import { LeadFormComponent } from './components/lead-form/lead-form';
import { ModelComponent } from './components/model/model';
import { SiteFooterComponent } from './components/site-footer/site-footer';
import { SiteHeaderComponent } from './components/site-header/site-header';
import { WorkPlanComponent } from './components/work-plan/work-plan';

/**
 *
 * Todo el contenido (quiénes somos, modelo de negocio, plan de trabajo,
 * públicos, catálogos y contacto) proviene de `/api/public/overview`: el
 * frontend sólo se encarga de la presentación.
 */
@Component({
  selector: 'dl-landing-page',
  imports: [
    SiteHeaderComponent,
    HeroComponent,
    AboutComponent,
    ModelComponent,
    WorkPlanComponent,
    AudiencesComponent,
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
