import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Añade estas importaciones
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// Registra el locale ANTES del bootstrap
registerLocaleData(localeEs);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));