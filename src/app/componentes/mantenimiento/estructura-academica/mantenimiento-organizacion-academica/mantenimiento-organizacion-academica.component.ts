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
import { MantenimientoTituloAcademicoService } from '../../../../servicios/mantenimiento/estructura-academica/titulo-academico/mantenimiento-titulo-academico.service';
import { MantenimientoDepartamentoService } from '../../../../servicios/mantenimiento/estructura-academica/departamento/mantenimiento-departamento.service';
import { MantenimientoCampusService } from '../../../../servicios/mantenimiento/estructura-academica/campus/mantenimiento-campus.service';
import { MantenimientoUniversidadService } from '../../../../servicios/mantenimiento/estructura-academica/universidad/mantenimiento-universidad.service';

@Component({
  selector: 'app-mantenimiento-organizacion-academica',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './mantenimiento-organizacion-academica.component.html',
  styleUrl: './mantenimiento-organizacion-academica.component.scss'
})

export class MantenimientoOrganizacionAcademicaComponent {


  @ViewChild('dtTipoDepartamento') dtTipoDepartamento: any;
  @ViewChild('dtDepartamento') dtDepartamento: any;
  @HostListener('window:resize', ['$event'])


  campus: any[] = [];
  campustitulo: any[] = [];
  campusdepartamento: any[] = [];
  titulo: any[] = [];
  departamentos: any[] = [];
  universidad: any[] = [];

  tipoSolicitudActual: string = '';

  nombreCampus: string = '';
  nombreDepartamento: string = '';
  nombreTituloAcademico: string = '';

  loadingtable: boolean = false;

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  loadingCampus: boolean = false;
  loadingCampusDepto: boolean = false;
  loadingCampusTitulo: boolean = false;

  isLoadingRegistrar: boolean = false;
  isLoadingActualizar: boolean = false;
  isLoadingEliminar: boolean = false;

  loadingDialogGeneral: boolean = false;
  loadingDialogActualizarCampus: boolean = false;
  loadingDialogEliminarCampus: boolean = false;
  loadingDialogActualizarCampusDepto: boolean = false;
  loadingDialogEliminarCampusDepto: boolean = false;
  loadingDialogActualizarCampusTitulo: boolean = false;
  loadingDialogEliminarCampusTitulo: boolean = false;

  visibleRegistrarCampus: boolean = false;
  visibleModificarCampus: boolean = false;
  visibleEliminarCampus: boolean = false;

  visibleRegistrarCampusDepto: boolean = false;
  visibleModificarCampusDepto: boolean = false;
  visibleEliminarCampusDepto: boolean = false;

  visibleRegistrarCampusTitulo: boolean = false;
  visibleModificarCampusTitulo: boolean = false;
  visibleEliminarCampusTitulo: boolean = false;

  searchValue: string | undefined;

  isMobile: boolean = false;

  activeTab: number = 0;
  tabActivoIndex: number = 0;

  closableDialog = true;
  formSubmitted: boolean = false;
  showError: boolean = false;

  limiteCaracteres = 250;


  RegistrarCampusForm: FormGroup;
  ActualizarCampusForm: FormGroup;
  RegistrarCampusDeptoForm: FormGroup;
  ActualizarCampusDeptoForm: FormGroup;
  RegistrarCampusTituloForm: FormGroup;
  ActualizarCampusTituloForm: FormGroup;


  //Declaracion de formulario modificar
  EliminarCampusform = new FormGroup({
    idCampus: new FormControl('', Validators.required),
    nombreCampus: new FormControl('', Validators.required)
  });

  //Declaracion de formulario modificar
  EliminarCampusDeptoform = new FormGroup({
    idCampusDepartamento: new FormControl('', Validators.required),
    nombreDepartamento: new FormControl('', Validators.required),
    nombreCampus: new FormControl('', [Validators.required])
  });

  //Declaracion de formulario modificar
  EliminarCampusTituloform = new FormGroup({
    idCampusTituloAcademico: new FormControl('', Validators.required),
    nombreTituloAcademico: new FormControl('', Validators.required),
    nombreCampus: new FormControl('', [Validators.required])
  });

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private srvMantenimientoDepartamentoService: MantenimientoDepartamentoService,
    private srvMantenimientoTituloAcademicoService: MantenimientoTituloAcademicoService,
    private srvMantenimientoUniversidadService: MantenimientoUniversidadService,
    private srvMantenimientoCampusService: MantenimientoCampusService
  ) {

    this.RegistrarCampusForm = this.fb.group({
      idUniversidad: new FormControl({ value: 1, disabled: true }),
      nombreCampus: new FormControl('', Validators.required)
    });

    //Declaracion de formulario modificar
    this.ActualizarCampusForm = this.fb.group({
      idCampus: new FormControl('', Validators.required),
      idUniversidad: new FormControl({ value: 1, disabled: true }),
      nombreCampus: new FormControl('', [Validators.required])
    });

    this.RegistrarCampusDeptoForm = this.fb.group({
      idCampus: new FormControl('', Validators.required),
      idDepartamento: new FormControl('', [Validators.required])
    });

    //Declaracion de formulario modificar
    this.ActualizarCampusDeptoForm = this.fb.group({
      idCampus: new FormControl('', Validators.required),
      idDepartamento: new FormControl('', [Validators.required]),
      idCampusDepartamento: new FormControl('', [Validators.required]),
      nombreDepartamento: new FormControl('', [Validators.required]),
      nombreCampus: new FormControl('', [Validators.required])
    });


    this.RegistrarCampusTituloForm = this.fb.group({
      idCampus: new FormControl('', Validators.required),
      idTituloAcademico: new FormControl('', [Validators.required])
    });

    //Declaracion de formulario modificar
    this.ActualizarCampusTituloForm = this.fb.group({
      idCampusTituloAcademico: new FormControl('', Validators.required),
      idCampus: new FormControl('', [Validators.required]),
      idTituloAcademico: new FormControl('', [Validators.required]),
      nombreTituloAcademico: new FormControl('', [Validators.required]),
      nombreCampus: new FormControl('', [Validators.required])
    });


  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.loadingtable = false;
    this.obtenerPermisos();
    this.cargarCampus();
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
  showDialog(dialogType: 'RegistrarCampus' | 'ModificarCampus' | 'EliminarCampus' | 'RegistrarCampusDepto' | 'ModificarCampusDepto' | 'EliminarCampusDepto' | 'RegistrarCampusTitulo' | 'ModificarCampusTitulo' | 'EliminarCampusTitulo') {
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

  onTabChange(event: string | number): void {
    const index = Number(event);
    this.tabActivoIndex = index;
    this.searchValue = ''; // Limpiar la búsqueda
    // Desactiva todos los loaders
    this.loadingtable = false
    this.loadingCampus = false;
    this.loadingCampusDepto = false;
    this.loadingCampusTitulo = false;
    // Activa el loader de la pestaña seleccionada y lanza la carga
    switch (index) {
      case 0:
        this.loadingCampus = true;
        this.cargarCampus();
        break;
      case 1:
        this.loadingCampusDepto = true;
        this.cargarCampusDepto();
        break;
      case 2:
        this.loadingCampusTitulo = true;
        this.cargarCampusTitulo();
        break;
    }
  }

  cargarCampusDepto(): void {
    this.loadingCampusDepto = true;
    this.srvMantenimientoCampusService.getCampusDepartamento().subscribe(
      (response: any[]) => {
        this.campusdepartamento = response.map((campus, index) => ({
          numero: index + 1, // Genera un número consecutivo
          ...campus,
          fechaModifico: campus.fechaModifico ? new Date(campus.fechaModifico) : null
        }));
        this.loadingCampusDepto = false; // Datos cargados con éxito
      },
      (error) => {
        this.loadingCampusDepto = false;  // Detener el estado de carga
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );
  }

  cargarCampusTitulo(): void {
    this.loadingCampusTitulo = true;
    this.srvMantenimientoCampusService.getCampusTituloAcademico().subscribe(
      (response: any[]) => {
        this.campustitulo = response.map((campus, index) => ({
          numero: index + 1, // Genera un número consecutivo
          ...campus,
          fechaModifico: campus.fechaModifico ? new Date(campus.fechaModifico) : null
        }));
        this.loadingCampusTitulo = false; // Datos cargados con éxito
      },
      (error) => {
        this.loadingCampusTitulo = false;  // Detener el estado de carga
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );
  }

  cargarCampus(): void {
    this.loadingCampus = true;
    this.srvMantenimientoCampusService.getCampus().subscribe(
      (response: any[]) => {
        this.campus = response.map((campus, index) => ({
          numero: index + 1, // Número consecutivo
          ...campus,
          fechaModifico: campus.fechaModifico ? new Date(campus.fechaModifico) : null
        }));
        this.loadingCampus = false; // Datos cargados con éxito
      },
      (error) => {
        this.loadingCampus = false;
        this.showErrorMessage(error);
      }
    );
  }

  cargarSelects(): void {
    //Cargar estados de usuario
    this.srvMantenimientoTituloAcademicoService.getTituloAcademico().subscribe(
      (response: any) => {
        this.titulo = response.result.map((departamento: any, index: number) => ({
          numero: index + 1, // Genera un número consecutivo
          ...departamento,
        }));
      },
      (error) => {
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );

    this.srvMantenimientoDepartamentoService.getDepartamento().subscribe(
      (response: any) => {
        this.departamentos = response.result.map((departamento: any, index: number) => ({
          numero: index + 1, // Genera un número consecutivo
          ...departamento
        }));

      },
      (error) => {
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );

    this.srvMantenimientoUniversidadService.getUniversidad().subscribe(
      (response: any) => {
        this.universidad = response.result;
      },
      (error) => {
        ////console.error('Error al obtener la información', error);
      }
    );
  }

  cargarDatos(campus: any, tipo: 'ModificarCampus' | 'EliminarCampus' | 'ModificarCampusDepto' | 'EliminarCampusDepto' | 'ModificarCampusTitulo' | 'EliminarCampusTitulo', tipoSolicitud: string): void {
    this.loadingDialogGeneral = true;
    this.tipoSolicitudActual = tipoSolicitud;

    // Reiniciar todos los spinners
    this.loadingDialogActualizarCampus = false;
    this.loadingDialogEliminarCampus = false;
    this.loadingDialogActualizarCampusDepto = false;
    this.loadingDialogEliminarCampusDepto = false;
    this.loadingDialogActualizarCampusTitulo = false;
    this.loadingDialogEliminarCampusTitulo = false;


    // Activar solo el spinner correspondiente al tipo
    if (tipo === 'ModificarCampus') {
      this.loadingDialogActualizarCampus = true;
    } else if (tipo === 'EliminarCampus') {
      this.loadingDialogEliminarCampus = true;
    } else if (tipo === 'ModificarCampusDepto') {
      this.loadingDialogActualizarCampusDepto = true;
    } else if (tipo === 'EliminarCampusDepto') {
      this.loadingDialogEliminarCampusDepto = true;
    } else if (tipo === 'ModificarCampusTitulo') {
      this.loadingDialogActualizarCampusTitulo = true;
    } else if (tipo === 'EliminarCampusTitulo') {
      this.loadingDialogEliminarCampusTitulo = true;
    }


    this.nombreCampus = campus.nombreCampus;
    this.nombreDepartamento = campus.nombreDepartamento;
    this.nombreTituloAcademico = campus.nombreTituloAcademico;

    this.ActualizarCampusForm.patchValue({
      idCampus: campus.idCampus,
      nombreCampus: campus.nombreCampus,
      idUniversidad: campus.idUniversidad,
    });

    this.EliminarCampusform.patchValue({
      idCampus: campus.idCampus,
      nombreCampus: campus.nombreCampus
    });


    this.ActualizarCampusDeptoForm.patchValue({
      idCampusDepartamento: campus.idCampusDepartamento,
      idCampus: campus.idCampus,
      idDepartamento: campus.idDepartamento,
      nombreCampus: campus.nombreCampus,
      nombreDepartamento: campus.nombreDepartamento,
    });

    this.EliminarCampusDeptoform.patchValue({
      idCampusDepartamento: campus.idCampusDepartamento,
      nombreCampus: campus.nombreCampus,
      nombreDepartamento: campus.nombreDepartamento,
    });


    this.ActualizarCampusTituloForm.patchValue({
      idCampus: campus.idCampus,
      idTituloAcademico: campus.idTituloAcademico,
      idCampusTituloAcademico: campus.idCampusTituloAcademico,
      nombreCampus: campus.nombreCampus,
      nombreTituloAcademico: campus.nombreTituloAcademico,
    });

    this.EliminarCampusTituloform.patchValue({
      idCampusTituloAcademico: campus.idCampusTituloAcademico,
      nombreCampus: campus.nombreCampus,
      nombreTituloAcademico: campus.nombreTituloAcademico,
    });




    // Simulación de carga
    setTimeout(() => {
      this.loadingDialogGeneral = false;
      this.loadingDialogActualizarCampus = false;
      this.loadingDialogEliminarCampus = false;
      this.loadingDialogActualizarCampusDepto = false;
      this.loadingDialogEliminarCampusDepto = false;
      this.loadingDialogActualizarCampusTitulo = false;
      this.loadingDialogEliminarCampusTitulo = false;

      setTimeout(() => {
        this.showDialog(tipo);
      }, 0);
    }, 300);
  }

  // ────────────────────────────────
  // Sección de Funciones para Integración con servicios Backend (APIs)
  // Insertar, Eliminar, Actualizar
  // ────────────────────────────────

  insertarCampus() {
    this.isLoadingRegistrar = true;
    this.RegistrarCampusForm.disable(); // deshabilitamos el formulario mientras se procesa
    this.closableDialog = false;

    // Usar getRawValue() para incluir controles deshabilitados como idUniversidad
    const formdata = this.RegistrarCampusForm.getRawValue();

    this.srvMantenimientoCampusService.postCampus(formdata).subscribe(
      (res: any) => {
        this.cargarCampus();
        this.RegistrarCampusForm.reset({ idUniversidad: 1 }); // reiniciar con idUniversidad en 1
        this.visibleRegistrarCampus = false;
        this.isLoadingRegistrar = false;
        this.RegistrarCampusForm.enable();
        this.closableDialog = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Campus Académico registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;

        const msg = error.error?.mensaje || 'Error al registrar el campus académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });

        this.RegistrarCampusForm.enable();
        this.closableDialog = true;
      }
    );
  }


  actualizarCampus() {
    this.isLoadingActualizar = true;

    // Usar getRawValue() para incluir controles deshabilitados como idUniversidad
    const formdata = this.ActualizarCampusForm.getRawValue();

    this.ActualizarCampusForm.disable();
    this.closableDialog = false;

    this.srvMantenimientoCampusService.putCampus(formdata).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Campus') {
          this.cargarCampus();
        } else if (this.tipoSolicitudActual === 'CampusDepto') {
          this.cargarCampusDepto();
        } else if (this.tipoSolicitudActual === 'CampusTitulo') {
          this.cargarCampusTitulo();
        }

        this.ActualizarCampusForm.reset({ idUniversidad: 1 }); // mantener idUniversidad en 1
        this.visibleModificarCampus = false;
        this.isLoadingActualizar = false;

        this.ActualizarCampusForm.enable();
        this.closableDialog = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Campus Académico actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;
        this.ActualizarCampusForm.enable();
        this.closableDialog = true;

        const msg = error.error?.mensaje || 'Error al actualizar el campus académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }


  eliminarCampus() {
    this.isLoadingEliminar = true;
    this.closableDialog = false;
    const idCampus = this.EliminarCampusform.value.idCampus;
    console.log(idCampus);
    this.srvMantenimientoCampusService.deleteCampus(idCampus).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Campus') {
          this.cargarCampus();
        } else if (this.tipoSolicitudActual === 'CampusDepto') {
          this.cargarCampusDepto();
        } else if (this.tipoSolicitudActual === 'CampusTitulo') {
          this.cargarCampusTitulo();
        }

        this.EliminarCampusform.reset();
        this.visibleEliminarCampus = false;
        this.isLoadingEliminar = false;
        this.closableDialog = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Campus Académico removido exitosamente exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: error.error?.mensaje || 'Error al remover el campus académico',
          life: 3000
        });
      }
    );
  }

  insertarCampusDepto() {
    this.isLoadingRegistrar = true;

    this.RegistrarCampusDeptoForm.disable();
    this.closableDialog = false;

    const formdata = this.RegistrarCampusDeptoForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoCampusService.postCampusDepartamento(formdata).subscribe(
      (res: any) => {
        this.cargarCampusDepto();
        this.RegistrarCampusDeptoForm.reset();
        this.visibleRegistrarCampusDepto = false;
        this.isLoadingRegistrar = false;

        this.RegistrarCampusDeptoForm.enable();
        this.closableDialog = true;
        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Departamento agregado exitosamente al Campus Académico',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;
        this.RegistrarCampusDeptoForm.enable();
        this.closableDialog = true;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al agregar el departamento en el campus académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarCampusDepto() {
    this.isLoadingActualizar = true;

    this.ActualizarCampusDeptoForm.disable();
    this.closableDialog = false;

    const formdata = this.ActualizarCampusDeptoForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoCampusService.putCampusDepartamento(formdata).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Campus') {
          this.cargarCampus();
        } else if (this.tipoSolicitudActual === 'CampusDepto') {
          this.cargarCampusDepto();
        } else if (this.tipoSolicitudActual === 'CampusTitulo') {
          this.cargarCampusTitulo();
        }

        this.ActualizarCampusDeptoForm.reset();
        this.visibleModificarCampusDepto = false;
        this.isLoadingActualizar = false;

        this.ActualizarCampusDeptoForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Departamento actualizado exitosamente en el Campus Académico',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;

        this.ActualizarCampusDeptoForm.enable();
        this.closableDialog = true;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el departamento en el campus académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarCampusDepto() {
    this.isLoadingEliminar = true;
    this.closableDialog = false;
    const idCampusDepartamento = this.EliminarCampusDeptoform.value.idCampusDepartamento;
    this.srvMantenimientoCampusService.deleteCampusDepartamento(idCampusDepartamento).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Campus') {
          this.cargarCampus();
        } else if (this.tipoSolicitudActual === 'CampusDepto') {
          this.cargarCampusDepto();
        } else if (this.tipoSolicitudActual === 'CampusTitulo') {
          this.cargarCampusTitulo();
        }

        this.EliminarCampusDeptoform.reset();
        this.visibleEliminarCampusDepto = false;
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Departamento removido exitosamente del Campus Académico',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensaje || error.message || 'Error al remover el departamento del campus.',
          life: 3000
        });
      }
    );
  }

  insertarCampusTitulo() {
    this.isLoadingRegistrar = true;

    this.RegistrarCampusTituloForm.disable();
    this.closableDialog = false;

    const formdata = this.RegistrarCampusTituloForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoCampusService.postCampusTituloAcademico(formdata).subscribe(
      (res: any) => {
        this.cargarCampusTitulo();
        this.RegistrarCampusTituloForm.reset();
        this.visibleRegistrarCampusTitulo = false;
        this.isLoadingRegistrar = false;

        this.RegistrarCampusTituloForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Título Académico agregado exitosamente al Campus Académico',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;

        this.RegistrarCampusTituloForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al agregar el título académico en el campus académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarCampusTitulo() {
    this.isLoadingActualizar = true;

    this.ActualizarCampusTituloForm.disable();
    this.closableDialog = false;

    const formdata = this.ActualizarCampusTituloForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoCampusService.putCampusTituloAcademico(formdata).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Campus') {
          this.cargarCampus();
        } else if (this.tipoSolicitudActual === 'CampusDepto') {
          this.cargarCampusDepto();
        } else if (this.tipoSolicitudActual === 'CampusTitulo') {
          this.cargarCampusTitulo();
        }

        this.ActualizarCampusTituloForm.reset();
        this.visibleModificarCampusTitulo = false;
        this.isLoadingActualizar = false;

        this.ActualizarCampusTituloForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Título Académico actualizado exitosamente en el Campus Académico',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;

        this.ActualizarCampusTituloForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el título académico en el campus académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarCampusTitulo() {
    this.isLoadingEliminar = true;
    this.closableDialog = false;
    const idCampusTituloAcademico = this.EliminarCampusTituloform.value.idCampusTituloAcademico;
    this.srvMantenimientoCampusService.deleteCampusTituloAcademico(idCampusTituloAcademico).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Campus') {
          this.cargarCampus();
        } else if (this.tipoSolicitudActual === 'CampusDepto') {
          this.cargarCampusDepto();
        } else if (this.tipoSolicitudActual === 'CampusTitulo') {
          this.cargarCampusTitulo();
        }

        this.EliminarCampusTituloform.reset();
        this.visibleEliminarCampusTitulo = false;
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Título Académico removido exitosamente del Campus Académico',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: error.error?.mensaje || 'Error al remover el título académico del campus académico',
          life: 3000
        });
      }
    );
  }
}

