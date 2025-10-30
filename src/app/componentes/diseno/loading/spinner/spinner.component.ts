// Angular Core
import { Component } from '@angular/core';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios de diseño
import { SpinnerService } from '../../../../servicios/diseno/spinner/spinner.service';

@Component({
  selector: 'app-spinner',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})

export class SpinnerComponent {

  constructor(public spinnerService: SpinnerService) {}
  
}
