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
import { MantenimientoFacultadService } from '../../../../servicios/mantenimiento/estructura-academica/facultad/mantenimiento-facultad.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';


@Component({
  selector: 'app-mantenimiento-facultades-academicas',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './mantenimiento-facultades-academicas.component.html',
  styleUrl: './mantenimiento-facultades-academicas.component.scss'
})

export class MantenimientoFacultadesAcademicasComponent implements OnInit {
  @Output() loadingCompleted = new EventEmitter<boolean>();

  nombreFacultad: string = '';
  searchValue: string | undefined;

  facultad: any[] = [];

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


  RegistrarForm: FormGroup;
  ActualizarForm: FormGroup;


  //Declaracion de formulario modificar
  Eliminarform = new FormGroup({
    idFacultad: new FormControl('', Validators.required),
    nombreFacultad: new FormControl('', Validators.required)
  });

  constructor(
    private messageService: MessageService,
    private srvMantenimientoFacultadService: MantenimientoFacultadService,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private router: Router,
    private layoutService: LayoutService,
    private fb: FormBuilder,
  ) {

    this.RegistrarForm = this.fb.group({
      nombreFacultad: new FormControl('', [Validators.required])
    });

    //Declaracion de formulario modificar
    this.ActualizarForm = this.fb.group({
      idFacultad: new FormControl('', [Validators.required]),
      nombreFacultad: new FormControl('', [Validators.required])
    });
  }


  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.loadingtable = true;
    this.layoutService.setHeader('Facultad');
    this.cargarFacultad();
    this.obtenerPermisos();
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

  cargarFacultad(): void {
    this.srvMantenimientoFacultadService.getFacultad().subscribe(
      (response: any) => {
        this.facultad = response.map((campus: any, index: number) => ({
          numero: index + 1,
          ...campus,
          fechaModifico: campus.fechaModifico ? new Date(campus.fechaModifico) : null
        }));
        this.loadingtable = false;
        this.loadingCompleted.emit(true);
      },
      (error) => {
        this.loadingtable = false;
        this.showErrorMessage(error);
        this.loadingCompleted.emit(true);
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

    this.nombreFacultad = universidad.nombreFacultad;

    this.ActualizarForm.patchValue({
      idFacultad: universidad.idFacultad,
      nombreFacultad: universidad.nombreFacultad,
    });

    this.Eliminarform.patchValue({
      idFacultad: universidad.idFacultad,
      nombreFacultad: universidad.nombreFacultad,
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

  insertarFacultad() {
    this.isLoadingRegistrar = true;
    this.RegistrarForm.disable();
    this.closableDialog = false;

    const formdata = this.RegistrarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoFacultadService.postFacultad(formdata).subscribe(
      (res: any) => {
        this.cargarFacultad();
        this.RegistrarForm.reset();
        this.visibleRegistrar = false;
        this.isLoadingRegistrar = false;

        this.RegistrarForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Facultad registrada exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;

        this.RegistrarForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar la facultad';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarFacultad() {
    this.isLoadingActualizar = true;

    this.ActualizarForm.disable();
    this.closableDialog = false;

    const formdata = this.ActualizarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoFacultadService.putFacultad(formdata).subscribe(
      (res: any) => {
        this.cargarFacultad();
        this.ActualizarForm.reset();
        this.visibleModificar = false;
        this.isLoadingActualizar = false;

        this.ActualizarForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Facultad actualizada exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;

        this.ActualizarForm.enable();
        this.closableDialog = true;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar la facultad';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarFacultad() {
    this.isLoadingEliminar = true;
    this.closableDialog = false;

    const idFacultad = this.Eliminarform.value.idFacultad;
    this.srvMantenimientoFacultadService.deleteFacultad(idFacultad).subscribe(
      (res: any) => {
        this.cargarFacultad();
        this.Eliminarform.reset();
        this.visibleEliminar = false;
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Facultad removida exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: error.error?.mensaje || 'Error al remover la facultad',
          life: 3000
        });
      }
    );
  }


}

