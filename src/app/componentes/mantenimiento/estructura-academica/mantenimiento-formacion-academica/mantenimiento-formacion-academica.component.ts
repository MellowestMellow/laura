// Angular Core
import { Component, ViewChild, HostListener } from '@angular/core';

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
import { MantenimientoGradoService } from '../../../../servicios/mantenimiento/estructura-academica/grado/mantenimiento-grado.service';
import { MantenimientoTituloAcademicoService } from '../../../../servicios/mantenimiento/estructura-academica/titulo-academico/mantenimiento-titulo-academico.service';
import { MantenimientoUniversidadService } from '../../../../servicios/mantenimiento/estructura-academica/universidad/mantenimiento-universidad.service';
import { MantenimientoFacultadService } from '../../../../servicios/mantenimiento/estructura-academica/facultad/mantenimiento-facultad.service';

@Component({
  selector: 'app-mantenimiento-formacion-academica',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './mantenimiento-formacion-academica.component.html',
  styleUrl: './mantenimiento-formacion-academica.component.scss'
})
export class MantenimientoFormacionAcademicaComponent {

  @ViewChild('dtTipoDepartamento') dtTipoDepartamento: any;
  @ViewChild('dtDepartamento') dtDepartamento: any;
  @HostListener('window:resize', ['$event'])

  universidad: any[] = [];
  facultad: any[] = [];
  grado: any[] = [];
  titulo: any[] = [];

  tipoSolicitudActual: string = '';
  nombreTituloAcademico: string = '';
  nombreGrado: string = '';

  loadingtable: boolean = false;

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  loadingGrado: boolean = false;
  loadingTitulo: boolean = false;
  isLoadingRegistrar: boolean = false;
  isLoadingActualizar: boolean = false;
  isLoadingEliminar: boolean = false;

  loadingDialogGeneral: boolean = false;
  loadingDialogActualizarGrado: boolean = false;
  loadingDialogEliminarGrado: boolean = false;
  loadingDialogActualizarTitulo: boolean = false;
  loadingDialogEliminarTitulo: boolean = false;

  visibleRegistrarGrado: boolean = false;
  visibleModificarGrado: boolean = false;
  visibleEliminarGrado: boolean = false;

  visibleRegistrarTitulo: boolean = false;
  visibleModificarTitulo: boolean = false;
  visibleEliminarTitulo: boolean = false;

  searchValue: string | undefined;

  isMobile: boolean = false;

  activeTab: number = 0;
  tabActivoIndex: number = 0;

  closableDialog = true;
  formSubmitted: boolean = false;
  showError: boolean = false;

  RegistrarGradoForm: FormGroup;
  ActualizarGradoForm: FormGroup;
  RegistrarTituloForm: FormGroup;
  ActualizarTituloForm: FormGroup;

  // Definir límites por campo
  limites: { [key: string]: number } = {
    nombreTituloAcademico: 250,
    nombreGrado: 50,
  };


  //Declaracion de formulario modificar
  EliminarGradoform = new FormGroup({
    idGrado: new FormControl('', Validators.required),
    nombreGrado: new FormControl('', Validators.required)
  });


  //Declaracion de formulario modificar
  EliminarTituloform = new FormGroup({
    idTituloAcademico: new FormControl('', Validators.required),
    nombreTituloAcademico: new FormControl('', Validators.required)
  });

  constructor(
    private messageService: MessageService,
    private router: Router,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private srvMantenimientoGradoService: MantenimientoGradoService,
    private srvMantenimientoTituloAcademicoService: MantenimientoTituloAcademicoService,
    private srvMantenimientoUniversidadService: MantenimientoUniversidadService,
    private srvMantenimientoFacultadService: MantenimientoFacultadService,
    private fb: FormBuilder,
  ) {

    this.RegistrarGradoForm = this.fb.group({
      nombreGrado: new FormControl('', [Validators.required]),
    });

    //Declaracion de formulario modificar
    this.ActualizarGradoForm = this.fb.group({
      idGrado: new FormControl('', Validators.required),
      nombreGrado: new FormControl('', Validators.required),
    });

    this.RegistrarTituloForm = this.fb.group({
      idFacultad: new FormControl('', [Validators.required]),
      idGrado: new FormControl('', [Validators.required]),
      idUniversidad: new FormControl('', [Validators.required]),
      nombreTituloAcademico: new FormControl('', [Validators.required]),
      aprobado: new FormControl('', [Validators.required])
    });

    //Declaracion de formulario modificar
    this.ActualizarTituloForm = this.fb.group({
      idTituloAcademico: new FormControl('', [Validators.required]),
      idFacultad: new FormControl('', [Validators.required]),
      idGrado: new FormControl('', [Validators.required]),
      idUniversidad: new FormControl('', [Validators.required]),
      nombreTituloAcademico: new FormControl('', [Validators.required]),
      aprobado: new FormControl('', [Validators.required])
    });

  }

  estadoTitulo = [
    { label: 'Activo', value: '1' },
    { label: 'Inactivo', value: '0' }
  ];


  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.loadingtable = false;
    this.obtenerPermisos();
    this.cargarGrado();
    this.cargarTitulo();
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
  showDialog(dialogType: 'RegistrarGrado' | 'ModificarGrado' | 'EliminarGrado' | 'RegistrarTitulo' | 'ModificarTitulo' | 'EliminarTitulo') {
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
    this.loadingTitulo = false;
    this.loadingGrado = false;

    // Activa el loader de la pestaña seleccionada y lanza la carga
    switch (index) {
      case 0:
        this.loadingTitulo = true;
        this.cargarTitulo();
        break;
      case 1:
        this.loadingGrado = true;
        this.cargarGrado();
        break;
    }
  }

  cargarGrado(): void {
    this.loadingGrado = true;
    this.srvMantenimientoGradoService.getGrado().subscribe(
      (response: any) => {
        this.grado = response.result.map((tiposDepartamento: any, index: number) => ({
          numero: index + 1, // Genera un número consecutivo
          ...tiposDepartamento,
          fechaModifico: tiposDepartamento.fechaModifico ? new Date(tiposDepartamento.fechaModifico) : null
        }));
        this.loadingGrado = false;
      },
      (error) => {
        this.loadingGrado = false;  // Detener el estado de carga
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );
  }

  cargarTitulo(): void {
    this.loadingTitulo = true;
    this.srvMantenimientoTituloAcademicoService.getTituloAcademico().subscribe(
      (response: any) => {
        this.titulo = response.result.map((departamento: any, index: number) => ({
          numero: index + 1, // Genera un número consecutivo
          ...departamento,
          fechaModifico: departamento.fechaModifico ? new Date(departamento.fechaModifico) : null
        }));
        this.loadingTitulo = false; // Datos cargados con éxito
      },
      (error) => {
        this.loadingTitulo = false;  // Detener el estado de carga
        this.showErrorMessage(error);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );
  }

  cargarDatos(departamento: any, tipo: 'ModificarGrado' | 'EliminarGrado' | 'ModificarTitulo' | 'EliminarTitulo', tipoSolicitud: string): void {
    this.loadingDialogGeneral = true;
    this.tipoSolicitudActual = tipoSolicitud;

    // Reiniciar todos los spinners
    this.loadingDialogActualizarGrado = false;
    this.loadingDialogEliminarGrado = false;
    this.loadingDialogActualizarTitulo = false;
    this.loadingDialogEliminarTitulo = false;



    // Activar solo el spinner correspondiente al tipo
    if (tipo === 'ModificarGrado') {
      this.loadingDialogActualizarGrado = true;
    } else if (tipo === 'EliminarGrado') {
      this.loadingDialogEliminarGrado = true;
    } else if (tipo === 'ModificarTitulo') {
      this.loadingDialogActualizarTitulo = true;
    } else if (tipo === 'EliminarTitulo') {
      this.loadingDialogEliminarTitulo = true;
    }

    this.nombreTituloAcademico = departamento.nombreTituloAcademico;
    this.nombreGrado = departamento.nombreGrado;

    this.ActualizarGradoForm.patchValue({
      idGrado: departamento.idGrado,
      nombreGrado: departamento.nombreGrado,
    });

    this.EliminarGradoform.patchValue({
      idGrado: departamento.idGrado,
      nombreGrado: departamento.nombreGrado,
    });

    this.ActualizarTituloForm.patchValue({
      idTituloAcademico: departamento.idTituloAcademico,
      idFacultad: departamento.idFacultad,
      idUniversidad: departamento.idUniversidad,
      idGrado: departamento.idGrado,
      nombreTituloAcademico: departamento.nombreTituloAcademico,
      aprobado: departamento.estadoAprobacion === 'Activo' ? '1' : '0'

    });

    console.log(
      'Valor aprobado actual:',
      this.ActualizarTituloForm.get('aprobado')?.value,
      'Opciones disponibles:',
      this.estadoTitulo
    );

    this.EliminarTituloform.patchValue({
      idTituloAcademico: departamento.idTituloAcademico,
      nombreTituloAcademico: departamento.nombreTituloAcademico,
    });

    // Simulación de carga
    setTimeout(() => {
      this.loadingDialogGeneral = false;
      this.loadingDialogActualizarGrado = false;
      this.loadingDialogEliminarGrado = false;
      this.loadingDialogActualizarTitulo = false;
      this.loadingDialogEliminarTitulo = false;
      setTimeout(() => {
        this.showDialog(tipo);
      }, 0);
    }, 300);
  }

  cargarSelects(): void {
    //Cargar estados de usuario
    this.srvMantenimientoUniversidadService.getUniversidad().subscribe(
      (response: any) => {
        this.universidad = response.result.map((campus: any, index: number) => ({
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

  insertarGrado() {
    this.isLoadingRegistrar = true;

    this.RegistrarGradoForm.disable();
    this.closableDialog = false;

    const formdata = this.RegistrarGradoForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoGradoService.postGrado(formdata).subscribe(
      (res: any) => {
        this.cargarGrado();
        this.RegistrarGradoForm.reset();
        this.visibleRegistrarGrado = false;
        this.isLoadingRegistrar = false;

        this.RegistrarGradoForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Grado Académico registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;

        this.RegistrarGradoForm.enable();
        this.closableDialog = true;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el grado académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  insertarTitulo() {
    this.isLoadingRegistrar = true;

    this.RegistrarTituloForm.disable();
    this.closableDialog = false;

    const formdata = this.RegistrarTituloForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoTituloAcademicoService.postTituloAcademico(formdata).subscribe(
      (res: any) => {
        this.cargarTitulo();
        this.RegistrarTituloForm.reset();
        this.visibleRegistrarTitulo = false;
        this.isLoadingRegistrar = false;
        this.RegistrarTituloForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Título Académico registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;
        this.RegistrarTituloForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el título académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarGrado() {
    this.isLoadingActualizar = true;

    this.ActualizarGradoForm.disable();
    this.closableDialog = false;

    const formdata = this.ActualizarGradoForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoGradoService.putGrado(formdata).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Grado') {
          this.cargarGrado();
        } else if (this.tipoSolicitudActual === 'Titulo') {
          this.cargarTitulo();
        }

        this.ActualizarGradoForm.enable();
        this.closableDialog = true;
        this.ActualizarGradoForm.reset();
        this.visibleModificarGrado = false;
        this.isLoadingActualizar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Grado Académico actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;

        this.ActualizarGradoForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el grado académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarTitulo() {
    this.isLoadingActualizar = true;

    this.ActualizarTituloForm.disable();
    this.closableDialog = false;

    const formdata = this.ActualizarTituloForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoTituloAcademicoService.putTituloAcademico(formdata).subscribe(
      (res: any) => {
        if (this.tipoSolicitudActual === 'Grado') {
          this.cargarGrado();
        } else if (this.tipoSolicitudActual === 'Titulo') {
          this.cargarTitulo();
        }

        this.ActualizarTituloForm.reset();
        this.visibleModificarTitulo = false;
        this.isLoadingActualizar = false;

        this.ActualizarTituloForm.enable();
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Título Académico actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.ActualizarTituloForm.enable();
        this.closableDialog = true;
        this.isLoadingActualizar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el título académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarGrado() {
    this.isLoadingEliminar = true;
    this.closableDialog = false;
    const idGrado = this.EliminarGradoform.value.idGrado;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoGradoService.deleteGrado(idGrado).subscribe(
      (res: any) => {

        if (this.tipoSolicitudActual === 'Grado') {
          this.cargarGrado();
        } else if (this.tipoSolicitudActual === 'Titulo') {
          this.cargarTitulo();
        }

        this.EliminarGradoform.reset();
        this.visibleEliminarGrado = false;
        this.isLoadingEliminar = false;
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Grado Académico removido exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al remover el grado académico';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  eliminarTitulo() {
    this.isLoadingEliminar = true;
    this.closableDialog = false;
    const idTituloAcademico = this.EliminarTituloform.value.idTituloAcademico;
    // Llamar al servicio para insertar usuario y persona
    this.srvMantenimientoTituloAcademicoService.deleteTituloAcademico(idTituloAcademico).subscribe(
      (res: any) => {
        if (this.tipoSolicitudActual === 'Grado') {
          this.cargarGrado();
        } else if (this.tipoSolicitudActual === 'Titulo') {
          this.cargarTitulo();
        }

        this.EliminarTituloform.reset();
        this.visibleEliminarTitulo = false;
        this.isLoadingEliminar = false;
        this.closableDialog = true;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Título Académico removido exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingEliminar = false;
        this.closableDialog = true;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al remover el título académico';
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
