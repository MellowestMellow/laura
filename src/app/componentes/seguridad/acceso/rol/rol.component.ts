// Angular Core
import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Angular Forms
import {
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../../servicios/seguridad/acceso/permiso/permiso.service';
import { RolService } from '../../../../servicios/seguridad/acceso/rol/rol.service';
import { BitacoraService } from '../../../../servicios/seguridad/acceso/bitacora/bitacora.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';

@Component({
  selector: 'app-rol',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './rol.component.html',
  styleUrl: './rol.component.scss'
})

export class RolComponent implements OnInit {
 @Output() loadingCompleted = new EventEmitter<boolean>();


  searchValue: string | undefined;
  nombreRol: string = '';

  rol: any[] = [];

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  loadingtable: boolean = false;
  loadingDialogGeneral: boolean = false;
  loadingDialogActualizar: boolean = false;
  loadingDialogEliminar: boolean = false;

  isLoadingRegistrar: boolean = false;
  isLoadingActualizar: boolean = false;
  isLoadingEliminar: boolean = false;

  visibleRegistrar: boolean = false;
  visibleModificar: boolean = false;
  visibleEliminar: boolean = false;


  //Declaracion de formulario registrar
  RegistrarForm = new FormGroup({
    rol: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
  });

  //Declaracion de formulario modificar
  ActualizarForm = new FormGroup({
    idRol: new FormControl('', Validators.required),
    rol: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required])
  });

  //Declaracion de formulario modificar
  Eliminarform = new FormGroup({
    idRol: new FormControl('', Validators.required),
    rol: new FormControl('', Validators.required)
  });


  constructor(
    private messageService: MessageService,
    private RolService: RolService,
    private Router: Router,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private cdr: ChangeDetectorRef,
    private BitacoraService: BitacoraService,
    private layoutService: LayoutService
  ) {

  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }


  ngOnInit(): void {
    this.layoutService.setHeader('Rol');
    this.loadingtable = true;
    this.cargarRol();
    this.obtenerPermisos();

  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 11; // El objeto que estás consultando

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
        //console.error('Error al obtener los permisos', error);
      }
    );
  }

  irPermisos(idRol: number, rol: string) {
    this.RolService.setNombreRol(rol);
    this.Router.navigate(['/seguridad/permiso', idRol]);
  }

  applyFilterGlobal(event: Event, table: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  clear(table: any) {
    table.clear();
    this.searchValue = '';  // Limpiar el valor del campo de búsqueda
    table.filterGlobal('', 'contains');  // Limpiar el filtro global
  }

  showDialog(dialogType: 'Registrar' | 'Modificar' | 'Eliminar') {
    this[`visible${dialogType}`] = true;
  }

  showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Operación Fallida',
      detail: message,
      life: 3000
    });
  }

  insertarBitacoraAjusteUsuario() {
    // Obtener el nombre del usuario desde el AuthService
    const nombreUsuario = this.AuthService.getNombreUsuario();

    // Construir la descripción dinámica
    const descripcion = `El Usuario ${nombreUsuario} consultó la pantalla de Roles.`;

    // Crear el objeto bitacora
    const bitacora = {
      idObjeto: 23,  // ID del objeto relacionado
      descripcion: descripcion,  // Descripción dinámica
      accion: 'Consultar',
    };

    // Llamar al servicio para insertar la bitácora
    this.BitacoraService.postBitacora(bitacora).subscribe(
      response => {
        //console.log('Bitacora registrada que consultó la pantalla de Ajustes:', response);
      },
      error => {
        //console.error('Error al registrar la bitacora:', error);
      }
    );
  }


  cargarRol(): void {
    this.RolService.getRol().subscribe(
      (response: any[]) => {
        this.rol = response.map((rol, index) => ({
          numero: index + 1, // Genera un número consecutivo
          ...rol
        }));
        this.loadingtable = false; // Datos cargados con éxito
        this.loadingCompleted.emit(true);
      },
      (error) => {
        this.loadingtable = false;  // Detener el estado de carga
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
        this.loadingCompleted.emit(true);
      }
    );
  }

  cargarDatos(rol: any, tipo: 'Modificar' | 'Eliminar'): void {
    this.loadingDialogGeneral = true;

    // Spinner individual
    if (tipo === 'Modificar') {
      this.loadingDialogActualizar = true;
      this.loadingDialogEliminar = false;
    } else {
      this.loadingDialogActualizar = false;
      this.loadingDialogEliminar = true;
    }

    this.nombreRol = rol.rol;


    this.ActualizarForm.patchValue({
      idRol: rol.idRol,
      rol: rol.rol,
      descripcion: rol.descripcion
    });


    this.Eliminarform.patchValue({
      idRol: rol.idRol,
      rol: rol.rol
    });

    // Simulación de carga
    setTimeout(() => {
      this.loadingDialogGeneral = false;
      this.loadingDialogActualizar = false;
      this.loadingDialogEliminar = false;

      setTimeout(() => {
        this.showDialog(tipo);
      }, 0);
    }, 300);
  }


  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // Insertar, Eliminar, Actulizar Roles
  // ────────────────────────────────

  insertarRol() {
    this.isLoadingRegistrar = true;
    const formdata = this.RegistrarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.RolService.postRol(formdata).subscribe(
      (res: any) => {
        this.cargarRol();
        this.RegistrarForm.reset();
        this.visibleRegistrar = false;
        this.isLoadingRegistrar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Rol registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el rol';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarRol() {
    this.isLoadingActualizar = true;
    const formdata = this.ActualizarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.RolService.putRol(formdata).subscribe(
      (res: any) => {
        this.cargarRol();
        this.ActualizarForm.reset();
        this.visibleModificar = false;
        this.isLoadingActualizar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Rol actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el rol';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarRol() {
    this.isLoadingEliminar = true;
    const formdata = this.Eliminarform.value.idRol ?? '';
    //console.log(formdata);
    this.RolService.deleteRol(formdata).subscribe(
      (res: any) => {
        this.cargarRol();
        this.Eliminarform.reset();
        this.visibleEliminar = false;
        this.isLoadingEliminar = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Usuario inactivado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: error.error?.mensaje || 'Error al inactivar el usuario',
          life: 3000
        });
      }
    );
  }




}
