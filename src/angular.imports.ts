// Import PrimeNG modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
import { CapitalizableDirective } from './app/directives/capitalizable/capitalizable.directive';
import { FormsModule } from '@angular/forms';
import { ValidacionesDirective } from './app/directives/validaciones/validaciones.directive';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        CapitalizableDirective,
        ValidacionesDirective,
        FullCalendarModule,
        FormsModule,
        CommonModule
    ],
      exports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        FullCalendarModule,
        CapitalizableDirective,
        ValidacionesDirective,
        FormsModule,
        CommonModule
      ],
  providers: [  ]
})
export class 
AngularImports {}
