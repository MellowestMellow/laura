// Angular Core
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

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

// Servicios - Mantenimiento Estructura Académica
import { MantenimientoPaisService } from '../../../../servicios/mantenimiento/estructura-academica/pais/mantenimiento-pais.service';
import { MantenimientoUniversidadService } from '../../../../servicios/mantenimiento/estructura-academica/universidad/mantenimiento-universidad.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';

@Component({
  selector: 'app-mantenimiento-universidad',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './mantenimiento-universidad.component.html',
  styleUrl: './mantenimiento-universidad.component.scss'
})
export class MantenimientoUniversidadComponent implements OnInit {

  @Output() loadingCompleted = new EventEmitter<boolean>();



  nombreUniversidad: string = '';
  searchValue: string | undefined;

  pais: any[] = [];
  universidad: any[] = [];

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

  closableDialog = true;
  formSubmitted: boolean = false;
  showError: boolean = false;

  limiteCaracteres = 250;

  //Declaracion de formulario modificar
  Eliminarform = new FormGroup({
    idUniversidad: new FormControl('', Validators.required),
    nombreUniversidad: new FormControl('', Validators.required)
  });

  RegistrarForm: FormGroup;
  ActualizarForm: FormGroup;

  constructor(
    private messageService: MessageService,
    private srvMantenimientoPaisService: MantenimientoPaisService,
    private srvMantenimientoUniversidadService: MantenimientoUniversidadService,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private router: Router,
    private layoutService: LayoutService,
    private fb: FormBuilder,
  ) {

    this.RegistrarForm = this.fb.group({
      idPais: new FormControl('', Validators.required),
      nombreUniversidad: new FormControl('', [Validators.required])
    });

    //Declaracion de formulario modificar
    this.ActualizarForm = this.fb.group({
      idPais: new FormControl('', Validators.required),
      idUniversidad: new FormControl('', [Validators.required]),
      nombreUniversidad: new FormControl('', [Validators.required])
    });
  }


  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────
  ngOnInit(): void {
    this.loadingtable = true;
    this.layoutService.setHeader('Universidad');
    this.cargarUniversidad();
    this.obtenerPermisos();
    this.cargarSelects();
  }

  regresarPanel() {
    this.router.navigate(['/panel/estructura/academica']);
  }

  applyFilterGlobal(event: Event, table: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 31; // El objeto que estás consultando

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
  }

  // Valida longitud de caracteres en cualquier form
  verificarLimiteCaracteres(formGroup: FormGroup, controlName: string) {
    const control = formGroup.get(controlName);
    if (control && control.value && control.value.length > this.limiteCaracteres) {
      control.setValue(control.value.slice(0, this.limiteCaracteres));
    }
  }

  // Valida si el control es inválido en cualquier form
  isInvalid(formGroup: FormGroup, controlName: string) {
    const control = formGroup.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Métodos para obtener solicitudes estratégicas, curriculares y administrativas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────

  cargarUniversidad(): void {
    this.srvMantenimientoUniversidadService.getUniversidad().subscribe(
      (response: any) => {
        this.universidad = response.result.map((campus: any, index: number) => ({
          numero: index + 1,
          ...campus,
          fechaModifico: campus.fechaModifico ? new Date(campus.fechaModifico) : null
        }));
        this.loadingtable = false;
        this.loadingCompleted.emit(true);
      },
      (error) => {
        this.loadingtable = false;
        this.loadingCompleted.emit(true);
        this.showErrorMessage(error);
      }
    );
  }

  cargarSelects(): void {
    //Cargar estados de usuario
    this.srvMantenimientoPaisService.getPais().subscribe(
      (response: any) => {
        this.pais = response;
      },
      (error) => {
        ////console.error('Error al obtener la información', error);
      }
    );
  }

  cargarDatos(universidad: any, tipo: 'Modificar' | 'Eliminar'): void {
    this.loadingDialogGeneral = true;

    // Spinner individual
    if (tipo === 'Modificar') {
      this.loadingDialogActualizar = true;
      this.loadingDialogEliminar = false;
    } else {
      this.loadingDialogActualizar = false;
      this.loadingDialogEliminar = true;
    }

    this.nombreUniversidad = universidad.nombreUniversidad;

    this.ActualizarForm.patchValue({
      idUniversidad: universidad.idUniversidad,
      nombreUniversidad: universidad.nombreUniversidad,
      idPais: universidad.idPais,
    });

    this.Eliminarform.patchValue({
      idUniversidad: universidad.idUniversidad,
      nombreUniversidad: universidad.nombreUniversidad
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
  // Sección de Funciones para Integración con servicios Backend (APIs)
  // Insertar, Eliminar, Actualizar
  // ────────────────────────────────

  insertarUniversidad() {
    this.isLoadingRegistrar = true;

    this.RegistrarForm.disable();
    this.closableDialog = false;

    const formdata = this.RegistrarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoUniversidadService.postUniversidad(formdata).subscribe(
      (res: any) => {

        this.cargarUniversidad();
        this.RegistrarForm.reset();
        this.visibleRegistrar = false;
        this.isLoadingRegistrar = false;
        this.RegistrarForm.enable();
        this.closableDialog = true;
        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Universidad registrada exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;
        // Mostrar mensaje de error
        this.RegistrarForm.enable();
        this.closableDialog = true;

        const msg = error.error?.mensaje || 'Error al registrar la Universidad';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarUniversidad() {
    this.isLoadingActualizar = true;

    this.ActualizarForm.disable();
    this.closableDialog = false;

    const formdata = this.ActualizarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoUniversidadService.putUniversidad(formdata).subscribe(
      (res: any) => {
        this.cargarUniversidad();
        this.ActualizarForm.reset();
        this.visibleModificar = false;
        this.isLoadingActualizar = false;
        this.ActualizarForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Universidad actualizada exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;
        this.ActualizarForm.enable();
        this.closableDialog = true;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar la universidad';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarUniversidad() {
    this.isLoadingEliminar = true;
    this.closableDialog = false;
    const idUniversidad = this.Eliminarform.value.idUniversidad;
    this.srvMantenimientoUniversidadService.deleteUniversidad(idUniversidad).subscribe(
      (res: any) => {
        this.cargarUniversidad();
        this.Eliminarform.reset();
        this.visibleEliminar = false;
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Universidad eliminada exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: error.error?.mensaje || 'Error al remover la universidad',
          life: 3000
        });
      }
    );
  }

}
