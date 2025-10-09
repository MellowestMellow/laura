// Angular Core
import { Component, Input } from '@angular/core';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

@Component({
  selector: 'app-footer',
   imports: [PrimeNGImports, AngularImports],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})

export class FooterComponent {
 currentYear: number = new Date().getFullYear();
  @Input() ready: boolean = false;
}
