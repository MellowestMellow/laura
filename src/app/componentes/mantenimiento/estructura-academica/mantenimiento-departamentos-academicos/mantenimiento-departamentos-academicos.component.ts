// Angular Core
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';

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
import { MantenimientoDepartamentoService } from '../../../../servicios/mantenimiento/estructura-academica/departamento/mantenimiento-departamento.service';
import { MantenimientoFacultadService } from '../../../../servicios/mantenimiento/estructura-academica/facultad/mantenimiento-facultad.service';

@Component({
  selector: 'app-mantenimiento-departamentos-academicos',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './mantenimiento-departamentos-academicos.component.html',
  styleUrl: './mantenimiento-departamentos-academicos.component.scss'
})
export class MantenimientoDepartamentosAcademicosComponent {

  @ViewChild('dtTipoDepartamento') dtTipoDepartamento: any;
  @ViewChild('dtDepartamento') dtDepartamento: any;
  @HostListener('window:resize', ['$event'])

  departamentos: any[] = [];
  tiposDepartamentos: any[] = [];
  facultad: any[] = [];


  tipoSolicitudActual: string = '';
  nombreDepartamento: string = '';
  tipoDepartamento: string = '';

  loadingtable: boolean = false;

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  loadingDepartamentos: boolean = false;
  loadingTipoDepartamentos: boolean = false;
  isLoadingRegistrar: boolean = false;
  isLoadingActualizar: boolean = false;
  isLoadingEliminar: boolean = false;

  loadingDialogGeneral: boolean = false;
  loadingDialogActualizarDepartamento: boolean = false;
  loadingDialogEliminarDepartamento: boolean = false;
  loadingDialogActualizarTipoDepartamento: boolean = false;
  loadingDialogEliminarTipoDepartamento: boolean = false;

  visibleRegistrarDepartamento: boolean = false;
  visibleModificarDepartamento: boolean = false;
  visibleEliminarDepartamento: boolean = false;

  visibleRegistrarTipoDepartamento: boolean = false;
  visibleModificarTipoDepartamento: boolean = false;
  visibleEliminarTipoDepartamento: boolean = false;

  searchValue: string | undefined;

  isMobile: boolean = false;

  activeTab: number = 0;
  tabActivoIndex: number = 0;


  closableDialog = true;
  formSubmitted: boolean = false;
  showError: boolean = false;

  RegistrarDeptoForm: FormGroup;
  ActualizarDeptoForm: FormGroup;
  RegistrarTipoDeptoForm: FormGroup;
  ActualizarTipoDeptoForm: FormGroup;

  // Definir límites por campo
  limites: { [key: string]: number } = {
    nombreDepartamento: 250,
    tipoDepartamento: 50,
  };

  //Declaracion de formulario modificar
  EliminarDeptoform = new FormGroup({
    idDepartamento: new FormControl('', Validators.required),
    nombreDepartamento: new FormControl('', Validators.required)
  });

  //Declaracion de formulario modificar
  EliminarTipoDeptoform = new FormGroup({
    idTipoDepartamento: new FormControl('', Validators.required),
    tipoDepartamento: new FormControl('', Validators.required)
  });

  constructor(
    private messageService: MessageService,
    private router: Router,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private srvMantenimientoDepartamentoService: MantenimientoDepartamentoService,
    private srvMantenimientoFacultadService: MantenimientoFacultadService,
    private fb: FormBuilder,
  ) {

    this.RegistrarDeptoForm = this.fb.group({
      idTipoDepartamento: new FormControl('', Validators.required),
      idFacultad: new FormControl('', Validators.required),
      nombreDepartamento: new FormControl('', [Validators.required]),
    });

    //Declaracion de formulario modificar
    this.ActualizarDeptoForm = this.fb.group({
      idDepartamento: new FormControl('', Validators.required),
      idTipoDepartamento: new FormControl('', Validators.required),
      idFacultad: new FormControl('', Validators.required),
      nombreDepartamento: new FormControl('', [Validators.required]),
    });

    this.RegistrarTipoDeptoForm = this.fb.group({
      tipoDepartamento: new FormControl('', [Validators.required])
    });

    //Declaracion de formulario modificar
    this.ActualizarTipoDeptoForm = this.fb.group({
      idTipoDepartamento: new FormControl('', Validators.required),
      tipoDepartamento: new FormControl('', [Validators.required]),
    });

  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.loadingtable = false;
    this.obtenerPermisos();
    this.cargarDepartamento();
    this.cargarTipoDepartamento();
    this.cargarSelects();
    this.isMobile = window.innerWidth <= 768;
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 4; // El objeto que estás consultando

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

  applyFilterGlobal(event: Event, table: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  clear(table: any) {
    table.clear();
    this.searchValue = '';  // Limpiar el valor del campo de búsqueda
    table.filterGlobal('', 'contains');  // Limpiar el filtro global
  }

  // Métodos para mostrar los distintos diálogos (Registrar, Modificar, Inactivar, Roles)
  showDialog(dialogType: 'RegistrarDepartamento' | 'ModificarDepartamento' | 'EliminarDepartamento' | 'RegistrarTipoDepartamento' | 'ModificarTipoDepartamento' | 'EliminarTipoDepartamento') {
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

  regresarPanel() {
    this.router.navigate(['/panel/estructura/academica']);
  }


  // Valida longitud de caracteres en cualquier form
  verificarLimiteCaracteres(formGroup: FormGroup, controlName: string) {
    const control = formGroup.get(controlName);
    const limite = this.limites[controlName] || 250; // valor por defecto
    if (control && control.value && control.value.length > limite) {
      control.setValue(control.value.slice(0, limite));
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

  onTabChange(event: string | number): void {
    const index = Number(event);
    this.tabActivoIndex = index;
    this.searchValue = ''; // Limpiar la búsqueda
    // Desactiva todos los loaders
    this.loadingtable = false
    this.loadingDepartamentos = false;
    this.loadingTipoDepartamentos = false;

    // Activa el loader de la pestaña seleccionada y lanza la carga
    switch (index) {
      case 0:
        this.loadingDepartamentos = true;
        this.cargarDepartamento();
        break;
      case 1:
        this.loadingTipoDepartamentos = true;
        this.cargarTipoDepartamento();
        break;
    }
  }

  cargarTipoDepartamento(): void {
    this.loadingTipoDepartamentos = true;
    this.srvMantenimientoDepartamentoService.getTipoDepartamento().subscribe(
      (response: any) => {
        this.tiposDepartamentos = response.result.map((tiposDepartamento: any, index: number) => ({
          numero: index + 1, // Genera un número consecutivo
          ...tiposDepartamento,
          fechaModifico: tiposDepartamento.fechaModifico ? new Date(tiposDepartamento.fechaModifico) : null
        }));
        this.loadingTipoDepartamentos = false;
      },
      (error) => {
        this.loadingTipoDepartamentos = false;  // Detener el estado de carga
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );
  }

  cargarDepartamento(): void {
    this.loadingDepartamentos = true;
    this.srvMantenimientoDepartamentoService.getDepartamento().subscribe(
      (response: any) => {
        this.departamentos = response.result.map((departamento: any, index: number) => ({
          numero: index + 1, // Genera un número consecutivo
          ...departamento,
          fechaModifico: departamento.fechaModifico ? new Date(departamento.fechaModifico) : null
        }));
        this.loadingDepartamentos = false; // Datos cargados con éxito
      },
      (error) => {
        this.loadingDepartamentos = false;  // Detener el estado de carga
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );
  }

  cargarDatos(departamento: any, tipo: 'ModificarDepartamento' | 'EliminarDepartamento' | 'ModificarTipoDepartamento' | 'EliminarTipoDepartamento', tipoSolicitud: string): void {
    this.loadingDialogGeneral = true;
    this.tipoSolicitudActual = tipoSolicitud;

    // Reiniciar todos los spinners
    this.loadingDialogActualizarDepartamento = false;
    this.loadingDialogEliminarDepartamento = false;
    this.loadingDialogActualizarTipoDepartamento = false;
    this.loadingDialogEliminarTipoDepartamento = false;

    // Activar solo el spinner correspondiente al tipo
    if (tipo === 'ModificarDepartamento') {
      this.loadingDialogActualizarDepartamento = true;
    } else if (tipo === 'EliminarDepartamento') {
      this.loadingDialogEliminarDepartamento = true;
    } else if (tipo === 'ModificarTipoDepartamento') {
      this.loadingDialogActualizarTipoDepartamento = true;
    } else if (tipo === 'EliminarTipoDepartamento') {
      this.loadingDialogEliminarTipoDepartamento = true;
    }

    this.nombreDepartamento = departamento.nombreDepartamento;
    this.tipoDepartamento = departamento.tipoDepartamento;

    this.ActualizarTipoDeptoForm.patchValue({
      idTipoDepartamento: departamento.idTipoDepartamento,
      tipoDepartamento: departamento.tipoDepartamento,
    });

    this.EliminarTipoDeptoform.patchValue({
      idTipoDepartamento: departamento.idTipoDepartamento,
      tipoDepartamento: departamento.tipoDepartamento,
    });

    this.ActualizarDeptoForm.patchValue({
      idDepartamento: departamento.idDepartamento,
      idTipoDepartamento: departamento.idTipoDepartamento,
      idFacultad: departamento.idFacultad,
      nombreDepartamento: departamento.nombreDepartamento,
    });

    this.EliminarDeptoform.patchValue({
      idDepartamento: departamento.idDepartamento,
      nombreDepartamento: departamento.nombreDepartamento,
    });

    // Simulación de carga
    setTimeout(() => {
      this.loadingDialogGeneral = false;
      this.loadingDialogActualizarDepartamento = false;
      this.loadingDialogEliminarDepartamento = false;
      this.loadingDialogActualizarTipoDepartamento = false;
      this.loadingDialogEliminarTipoDepartamento = false;
      setTimeout(() => {
        this.showDialog(tipo);
      }, 0);
    }, 300);
  }

  cargarSelects(): void {
    //Cargar estados de usuario
    this.srvMantenimientoFacultadService.getFacultad().subscribe(
      (response: any) => {
        this.facultad = response.map((campus: any, index: number) => ({
          numero: index + 1,
          ...campus
        }));
        this.loadingtable = false;
      },
      (error) => {
        this.loadingtable = false;
        this.showErrorMessage(error);
      }
    );
  }

  // ────────────────────────────────
  // Sección de Funciones para Integración con servicios Backend (APIs)
  // Insertar, Eliminar, Actualizar
  // ────────────────────────────────

  insertarTipoDepartamento() {
    this.isLoadingRegistrar = true;

    this.RegistrarTipoDeptoForm.disable();
    this.closableDialog = false;

    const formdata = this.RegistrarTipoDeptoForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoDepartamentoService.postTipoDepartamento(formdata).subscribe(
      (res: any) => {
        this.cargarTipoDepartamento();
        this.RegistrarTipoDeptoForm.reset();
        this.visibleRegistrarTipoDepartamento = false;
        this.isLoadingRegistrar = false;

        this.RegistrarTipoDeptoForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Tipo de Departamento registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;

        this.RegistrarTipoDeptoForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el Tipo de Departamento';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  insertarDepartamento() {
    this.isLoadingRegistrar = true;

    this.RegistrarDeptoForm.disable();
    this.closableDialog = false;

    const formdata = this.RegistrarDeptoForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoDepartamentoService.postDepartamento(formdata).subscribe(
      (res: any) => {
        this.cargarDepartamento();
        this.RegistrarDeptoForm.reset();
        this.visibleRegistrarDepartamento = false;
        this.isLoadingRegistrar = false;

        this.RegistrarDeptoForm.enable();
        this.closableDialog = true;


        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Departamento registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;

        this.RegistrarDeptoForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el Departamento';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarTipoDepartamento() {
    this.isLoadingActualizar = true;

    this.ActualizarTipoDeptoForm.disable();
    this.closableDialog = false;

    const formdata = this.ActualizarTipoDeptoForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoDepartamentoService.putTipoDepartamento(formdata).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Departamento') {
          this.cargarDepartamento();
        } else if (this.tipoSolicitudActual === 'TipoDepartamento') {
          this.cargarTipoDepartamento();
        }

        this.ActualizarTipoDeptoForm.reset();
        this.visibleModificarTipoDepartamento = false;
        this.isLoadingActualizar = false;

        this.ActualizarTipoDeptoForm.enable();
        this.closableDialog = true;


        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Tipo de Departamento actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;

        this.ActualizarTipoDeptoForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el Tipo de Departamento';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarDepartamento() {
    this.ActualizarDeptoForm.disable();
    this.closableDialog = false;

    this.isLoadingActualizar = true;
    const formdata = this.ActualizarDeptoForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoDepartamentoService.putDepartamento(formdata).subscribe(
      (res: any) => {
        if (this.tipoSolicitudActual === 'Departamento') {
          this.cargarDepartamento();
        } else if (this.tipoSolicitudActual === 'TipoDepartamento') {
          this.cargarTipoDepartamento();
        }

        this.ActualizarDeptoForm.reset();
        this.visibleModificarDepartamento = false;
        this.isLoadingActualizar = false;
        this.ActualizarDeptoForm.enable();
        this.closableDialog = true;


        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Departamento actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.ActualizarDeptoForm.enable();
        this.closableDialog = true;

        this.isLoadingActualizar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el departamento';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarTipoDepartamento() {
    this.closableDialog = false;
    this.isLoadingEliminar = true;
    const idTipoDepartamento = this.EliminarTipoDeptoform.value.idTipoDepartamento;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoDepartamentoService.deleteTipoDepartamento(idTipoDepartamento).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Departamento') {
          this.cargarDepartamento();
        } else if (this.tipoSolicitudActual === 'TipoDepartamento') {
          this.cargarTipoDepartamento();
        }
        this.closableDialog = true;
        this.EliminarTipoDeptoform.reset();
        this.visibleEliminarTipoDepartamento = false;
        this.isLoadingEliminar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Tipo de Departamento removido exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.closableDialog = true;
        this.isLoadingEliminar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al remover el Tipo de Departamento';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarDepartamento() {
    this.closableDialog = false;
    this.isLoadingEliminar = true;
    const idDepartamento = this.EliminarDeptoform.value.idDepartamento;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoDepartamentoService.deleteDepartamento(idDepartamento).subscribe(
      (res: any) => {
        if (this.tipoSolicitudActual === 'Departamento') {
          this.cargarDepartamento();
        } else if (this.tipoSolicitudActual === 'TipoDepartamento') {
          this.cargarTipoDepartamento();
        }
        this.closableDialog = true;
        this.EliminarDeptoform.reset();
        this.visibleEliminarDepartamento = false;
        this.isLoadingEliminar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Departamento removido exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.closableDialog = true;
        this.isLoadingEliminar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al remover el departamento';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

}
