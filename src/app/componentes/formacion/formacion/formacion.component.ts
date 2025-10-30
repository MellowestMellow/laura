// Angular Core
import { Component, OnInit } from '@angular/core';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../primeng.imports';
import { AngularImports } from '../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../servicios/seguridad/acceso/permiso/permiso.service';


@Component({
  selector: 'app-formacion',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './formacion.component.html',
  styleUrl: './formacion.component.scss'
})
export class FormacionComponent implements OnInit {

  constructor(
    private messageService: MessageService,
    private AuthService: AuthService,
    private PermisoService: PermisoService
  ) { }

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;


  loadingtable: boolean = false;

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────


  ngOnInit(): void {
    this.loadingtable = false;
    this.obtenerPermisos();
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 17; // El objeto que estás consultando

    this.PermisoService.getPermiso({ idObjeto, roles }).subscribe(
      (permisos: any[]) => {
        if (permisos?.length > 0) {
          const permiso = permisos[0];
          this.permisoActualizar = permiso.permisoActualizar;
          this.permisoInsertar = permiso.permisoInsertar;
          this.permisoEliminar = permiso.permisoEliminar;
        }
      },
      (error) => {
        console.error('Error al obtener los permisos', error);
      }
    );
  }

}