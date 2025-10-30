// Angular Core
import { Component, EventEmitter, Output } from '@angular/core';

// Angular Forms
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
import { MantenimientoObjetoService } from '../../../../servicios/mantenimiento/seguridad/objeto/mantenimiento-objeto.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';


@Component({
  selector: 'app-mantenimiento-objetos',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './mantenimiento-objetos.component.html',
  styleUrl: './mantenimiento-objetos.component.scss'
})
export class MantenimientoObjetosComponent {
  @Output() loadingCompleted = new EventEmitter<boolean>();

  nombreObjeto: string = '';
  searchValue: string | undefined;

  tipoObjeto: any[] = [];
  objeto: any[] = [];

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
    idTipoObjeto: new FormControl('', [Validators.required]),
    objeto: new FormControl('', [Validators.required])
  });

  //Declaracion de formulario modificar
  ActualizarForm = new FormGroup({
    idObjeto: new FormControl('', Validators.required),
    idTipoObjeto: new FormControl('', [Validators.required]),
    objeto: new FormControl('', [Validators.required])
  });

  //Declaracion de formulario modificar
  Eliminarform = new FormGroup({
    idObjeto: new FormControl('', Validators.required),
    objeto: new FormControl('', Validators.required)
  });

  constructor(
    private messageService: MessageService,
    private srvMantenimientoObjetoService: MantenimientoObjetoService,
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
    this.layoutService.setHeader('Objetos');
    this.cargarObjetos();
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

  showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Operación Fallida',
      detail: message,
      life: 3000
    });
  }
  // Métodos para mostrar los distintos diálogos (Registrar, Modificar, Inactivar, Roles)
  showDialog(dialogType: 'Registrar' | 'Modificar' | 'Eliminar') {
    this[`visible${dialogType}`] = true;
    if (dialogType === 'Registrar' || dialogType === 'Modificar') {
      this.cargarTipoObjeto();
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
  cargarObjetos(): void {
    this.srvMantenimientoObjetoService.getObjetos().subscribe(
      (response: any[]) => {
        this.objeto = response.map((objeto, index) => ({
          numero: index + 1, // Genera un número consecutivo
          ...objeto
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

  cargarTipoObjeto(): void {
    this.srvMantenimientoObjetoService.getTiposObjeto().subscribe(
      (response: any[]) => {
        this.tipoObjeto = response.map((TipoObjeto, index) => ({
          numero: index + 1, // Genera un número consecutivo
          ...TipoObjeto
        }));
        this.loadingtable = false; // Datos cargados con éxito
      },
      (error) => {
        this.loadingtable = false;  // Detener el estado de carga
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );
  }

  cargarDatos(objeto: any, tipo: 'Modificar' | 'Eliminar'): void {
    this.loadingDialogGeneral = true;

    // Spinner individual
    if (tipo === 'Modificar') {
      this.cargarTipoObjeto();
      this.loadingDialogActualizar = true;
      this.loadingDialogEliminar = false;
    } else {
      this.loadingDialogActualizar = false;
      this.loadingDialogEliminar = true;
    }

    this.nombreObjeto = objeto.objeto;


    this.ActualizarForm.patchValue({
      idObjeto: objeto.idObjeto,
      idTipoObjeto: objeto.idTipoObjeto,
      objeto: objeto.objeto,
    });


    this.Eliminarform.patchValue({
      idObjeto: objeto.idObjeto,
      objeto: objeto.objeto
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
  // Inserts, Actualizacion y Eliminacion de Roles
  // ────────────────────────────────

  insertarObjeto() {
    this.isLoadingRegistrar = true;
    const formdata = this.RegistrarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoObjetoService.postObjetos(formdata).subscribe(
      (res: any) => {
        this.cargarObjetos();
        this.RegistrarForm.reset();
        this.visibleRegistrar = false;
        this.isLoadingRegistrar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Objeto registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el objeto';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarObjeto() {
    this.isLoadingActualizar = true;
    const formdata = this.ActualizarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoObjetoService.putObjetos(formdata).subscribe(
      (res: any) => {
        this.cargarObjetos();
        this.ActualizarForm.reset();
        this.visibleModificar = false;
        this.isLoadingActualizar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Objeto actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el objeto';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarObjeto() {
    this.isLoadingEliminar = true;
    const formdata = this.Eliminarform.value.idObjeto ?? '';
    console.log(formdata);
    this.srvMantenimientoObjetoService.deleteObjetos(formdata).subscribe(
      (res: any) => {
        this.cargarObjetos();
        this.Eliminarform.reset();
        this.visibleEliminar = false;
        this.isLoadingEliminar = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Objeto eliminado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: error.error?.mensaje || 'Error al eliminar el objeto',
          life: 3000
        });
      }
    );
  }

}
