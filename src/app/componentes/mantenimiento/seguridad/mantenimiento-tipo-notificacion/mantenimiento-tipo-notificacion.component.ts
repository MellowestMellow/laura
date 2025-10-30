// Angular Core
import { Component, EventEmitter, Output } from '@angular/core';

// Angular Forms
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

// Angular Router
import { Router } from '@angular/router';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../../servicios/seguridad/acceso/permiso/permiso.service';

// Servicios - Mantenimiento
import { MantenimientoNotificacionService } from '../../../../servicios/mantenimiento/seguridad/notificacion/mantenimiento-notificacion.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';


@Component({
  selector: 'app-mantenimiento-tipo-notificacion',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './mantenimiento-tipo-notificacion.component.html',
  styleUrl: './mantenimiento-tipo-notificacion.component.scss'
})

export class MantenimientoTipoNotificacionComponent {
  @Output() loadingCompleted = new EventEmitter<boolean>();

  nombreTipoNotificacion: string = '';
  searchValue: string | undefined;

  tipoNotificacion: any[] = [];

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
    tipoNotificacion: new FormControl('', [Validators.required])
  });

  //Declaracion de formulario modificar
  ActualizarForm = new FormGroup({
    idTipoNotificacion: new FormControl('', Validators.required),
    tipoNotificacion: new FormControl('', [Validators.required])
  });

  //Declaracion de formulario modificar
  Eliminarform = new FormGroup({
    idTipoNotificacion: new FormControl('', Validators.required),
    tipoNotificacion: new FormControl('', Validators.required)
  });

  constructor(
    private messageService: MessageService,
    private srvMantenimientoNotificacionService: MantenimientoNotificacionService,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private router: Router,
    private layoutService: LayoutService
  ) {

  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.loadingtable = true;
    this.layoutService.setHeader('Tipo Notificacion');
    this.cargarTipoNotificacion();
    this.obtenerPermisos();
  }

  applyFilterGlobal(event: Event, table: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 23; // El objeto que estás consultando

    this.PermisoService.getPermiso({ idObjeto, roles }).subscribe(
      (permisos: any[]) => {
        if (permisos?.length > 0) {
          0
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

  clear(table: any) {
    table.clear();
    this.searchValue = '';  // Limpiar el valor del campo de búsqueda
    table.filterGlobal('', 'contains');  // Limpiar el filtro global
  }

  showErrorMessage(mensaje: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Operación Fallida',
      detail: mensaje,
      life: 3000
    });
  }

  // Métodos para mostrar los distintos diálogos (Registrar, Modificar, Inactivar, Roles)
  showDialog(dialogType: 'Registrar' | 'Modificar' | 'Eliminar') {
    this[`visible${dialogType}`] = true;
    if (dialogType === 'Registrar' || dialogType === 'Modificar') {
      this.cargarTipoNotificacion();
    }
  }

  regresarPanel() {
    this.router.navigate(['/panel/seguridad']);
  }

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────

  //Funcion para traer la información de parametros
  cargarTipoNotificacion(): void {
    this.srvMantenimientoNotificacionService.getTipoNotificacion().subscribe(
      (response: any[]) => {
        this.tipoNotificacion = response.map((tipoNotificacion, index) => ({
          numero: index + 1, // Genera un número consecutivo
          ...tipoNotificacion
        }));
        this.loadingtable = false; // Datos cargados con éxito
        this.loadingCompleted.emit(true);
      },
      (error) => {
        this.loadingtable = false;  // Detener el estado de carga
        this.loadingCompleted.emit(true);
        this.showErrorMessage(error.error.mensaje);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );
  }

  cargarDatos(objeto: any, tipo: 'Modificar' | 'Eliminar'): void {
    this.loadingDialogGeneral = true;

    // Spinner individual
    if (tipo === 'Modificar') {
      this.cargarTipoNotificacion();
      this.loadingDialogActualizar = true;
      this.loadingDialogEliminar = false;
    } else {
      this.loadingDialogActualizar = false;
      this.loadingDialogEliminar = true;
    }

    this.nombreTipoNotificacion = objeto.tipoNotificacion;


    this.ActualizarForm.patchValue({
      idTipoNotificacion: objeto.idTipoNotificacion,
      tipoNotificacion: objeto.tipoNotificacion,
    });


    this.Eliminarform.patchValue({
      idTipoNotificacion: objeto.idTipoNotificacion,
      tipoNotificacion: objeto.tipoNotificacion
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
  // Inserts, Actualizacion y Eliminacion de Tipo de Notificacion
  // ────────────────────────────────

  insertarTipoNotificacion() {
    this.isLoadingRegistrar = true;
    const formdata = this.RegistrarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoNotificacionService.postTipoNotificacion(formdata).subscribe(
      (res: any) => {
        this.cargarTipoNotificacion();
        this.RegistrarForm.reset();
        this.visibleRegistrar = false;
        this.isLoadingRegistrar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Tipo de Notificación registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el tipo de notificación';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarTipoNotificacion() {
    this.isLoadingActualizar = true;
    const formdata = this.ActualizarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoNotificacionService.putTipoNotificacion(formdata).subscribe(
      (res: any) => {
        this.cargarTipoNotificacion();
        this.ActualizarForm.reset();
        this.visibleModificar = false;
        this.isLoadingActualizar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Tipo de Notificación actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el tipo de notificación';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarTipoNotificacion() {
    this.isLoadingEliminar = true;
    const formdata = this.Eliminarform.value.idTipoNotificacion ?? '';
    console.log(formdata);
    this.srvMantenimientoNotificacionService.deleteTipoNotificacion(formdata).subscribe(
      (res: any) => {
        this.cargarTipoNotificacion();
        this.Eliminarform.reset();
        this.visibleEliminar = false;
        this.isLoadingEliminar = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.mensaje || 'Tipo de notificación eliminada exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: error.error?.mensaje || 'Error al eliminar el tipo de notificación',
          life: 3000
        });
      }
    );
  }
}
