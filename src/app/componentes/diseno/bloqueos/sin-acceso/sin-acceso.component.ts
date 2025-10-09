// Angular Core
import { Component } from '@angular/core';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';

@Component({
  selector: 'app-sin-acceso',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './sin-acceso.component.html',
  styleUrl: './sin-acceso.component.scss'
})

export class SinAccesoComponent {
  visibleBtnMenu: boolean = false;
  roles: number[] = [];


  constructor(
    private AuthService: AuthService
  ){
  }

  ngOnInit(): void {
    this.roles = this.AuthService.getRolesFromToken() || [];
    // Verificar si el usuario tiene el rol 21 (usuario externo a la direccion de docencia)
    if(!this.roles.includes(21)){
      this.visibleBtnMenu = true;
    }
  }
}
