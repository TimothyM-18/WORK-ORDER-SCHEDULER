/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { provideAnimations } from '@angular/platform-browser/animations';
import { App } from './app/app';




bootstrapApplication(App, {
  providers: [
    provideAnimations()
  ]
})
  .catch((err) => console.error(err));;
