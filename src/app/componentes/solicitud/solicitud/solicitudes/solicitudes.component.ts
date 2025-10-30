// Angular Core
import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';

// Angular Forms
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

// Librerías externas
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../../servicios/seguridad/acceso/permiso/permiso.service';

// Servicios - Solicitud
import { AsignacionService } from '../../../../servicios/solicitud/asignacion/asignacion.service';
import { SolicitudService } from '../../../../servicios/solicitud/solicitud/solicitud.service';
import { HistorialService } from '../../../../servicios/solicitud/historial/historial.service';

// Servicios - Otros
import { ArchivoService } from '../../../../servicios/archivo/archivo.service';
import { ComisionService } from '../../../../servicios/comision/comision.service';
import { ReporteService } from '../../../../servicios/reporte/reporte.service';

// Componentes
import { HistorialModalComponent } from '../../historial/historial-modal/historial-modal.component';
import { ParametroService } from '../../../../servicios/seguridad/parametro/parametro.service';
import { HistorialArchivoComponent } from '../../historial/historial-archivo/historial-archivo.component';

@Component({
  selector: 'app-solicitudes',
  imports: [PrimeNGImports, AngularImports, HistorialModalComponent, HistorialArchivoComponent ],
  providers: [MessageService],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.scss'
})
export class SolicitudesComponent implements OnInit {

  @ViewChild('filePopover') filePopover: any;
  //@HostListener('window:resize', ['$event'])
  @ViewChild('uploader') uploader!: FileUpload;
  @ViewChild('dtAdministrativa') dtAdministrativa: any;
  @ViewChild('dtCurricular') dtCurricular: any;
  @ViewChild('dtEstrategica') dtEstrategica: any;
  @ViewChild('historialHijo') historialHijo!: HistorialArchivoComponent;

  /** ROLES CON PERMISOS PARA REALIZAR ACCIONES
   * ROLES INTERNOS DE DD
    * 3	  Director
    * 4	  Asistente Técnico Estratégico
    * 5	  Asistente Operativo
    * 7	  Coordinador del Departamento de Gestión de la Práctica Educativa
    * 8	  Coordinador del Departamento de Evaluación Curricular
    * 9	  Coordinador del Departamento de Diseño y Actualización Curricular
    * ROLES PARA POSFASE Y DAFT
    * 23	Espacialista Gestión Curricular
    * 24	Director Curricular
    * 25	Asistente de Dirección
    * 26	Asistente Curricular (Operativo)
  **/

  private rolesConPermisosAcciones = [3, 4, 5, 7, 8, 9, 24, 25, 26, 27];
  private rolesConPermisosAccionesEnlaces = [3, 4, 7, 8, 9, 24, 25, 27];

  AsignacionRolForm!: FormGroup;
  UsuarioForm!: FormGroup;
  MiembrosForm!: FormGroup;
  DenegarForm: FormGroup;
  AsignarForm: FormGroup;
  RevisionAsignacionForm: FormGroup;
  FormatoForm: FormGroup;


  ticket: string = '';
  nombreSolicitud: string = '';
  nombreSubComision: string = '';
  tipoSolicitudActual: string = '';
  tipoSolicitud: string = '';
  nombreTicketSeleccionado: string = '';
  globalFilter: string = '';
  tituloDialogo: string = '';
    tituloDialogoFormato: string = '';
  solicitudSeleccionada: any;
  solicitudEstrategica: any[] = [];
  
  solicitudCurricular: any[] = [];
  solicitudAdministrativa: any[] = [];
  integrantes: any[] = [];
  asignado: any[] = [];
  usuarioRol: any[] = [];
  archivos: any[] = [];
  usuariosTotales: any[] = [];
  usuariosDisponibles: any[] = [];
  listaSolicitudes: any[] = [];
  historialEstados: any[] = [];
  estadosSeleccionados: any[] = [];
  plantillas: any[] = [];
  formatos: any[] = [];


  loadingPlantillaId: boolean = false;
  loadingSolicitudEstrategica: boolean = false;
  loadingSolicitudCurricular: boolean = false;
  loadingSolicitudAdministrativa: boolean = false;
  isLoadingDatosAsignacion: boolean = false;
  isLoadingDatosRevision: boolean = false;
  isLoadingDatosRevisionAsignacion: boolean = false;
  isLoadingDatosDenegar: boolean = false;
  isLoadingDatosMantener: boolean = false;
  isLoadingDatosCurricular: boolean = false;
  isLoadingAsignacion: boolean = false;
  isLoadingDenegar: boolean = false;
  isLoadingAceptar: boolean = false;
  isLoadingAsignacionUsuario: boolean = false;
  isLoadingAsignados: boolean = false;
  isLoadingDelegar: boolean = false;
  isLoadingAceptarRevision: boolean = false;
  isLoadingRechazarRevision: boolean = false;
  subirArchivo: boolean = false;
  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;
  permisoAsignar: boolean = false;
  invalidFiles: boolean = false;

  searchValue: string | undefined;

  loadingtable: boolean = false;
  loadingAsignados: boolean = false;
  loadingDialogGeneral: boolean = false;
  loadingDenegar: boolean = false;
  loadingFecha: boolean = false;
  loadingDialogIntegrante: boolean = false;
  loadingDialogAsignado: boolean = false;
  loadingAsignar: boolean = false;
  isLoadingFormato: boolean = false;
  isLoadingAsignar: boolean = false;
  isLoadingArchivos: boolean = false;
  loadingHistorial: boolean = false;
  loadingEtapa: boolean = false;
  loadingInformacion = false


  visibleAsignar: boolean = false;
  visibleIntegrante: boolean = false;
  visibleInformacion: boolean = false;
  visibleAsignados: boolean = false;
  visibleRevision: boolean = false;
  visibleRevisionAsignacion: boolean = false;
  visibleDenegar: boolean = false;
  visibleMantener: boolean = false;
  visibleAsignacion: boolean = false;
  visibleAsignacionDepartamento: boolean = false;
  visibleAsignacionCurricular: boolean = false;
  visibleEtapas: boolean = false;
  cerrarFormato: any;
  visibleFormato: boolean = false;
  esSolicitudExterna: boolean = false;
  esAsignadorActual: boolean = false;
  permitidos = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.,\-@:;()"%#]*$/;
  palabrasProhibidas = /(select|insert|delete|update|drop|alter|create|exec|truncate)/gi;
  mostrarColumnaSalida: boolean = false;
  mostrarColumnaBorradores: boolean = true;

  loadingBtnKey: string | null = null;
  loadingIndex: number | null = null;

  mostrarTabs: boolean = false;
  mostrarHistorial: boolean = false;
  mostrarFormularioFecha: boolean = false;
  mostrarFormularioMiembros: boolean = false;

  isMobile: boolean = false;

  loadingArchivoId: number | null = null;
  loadingSolicitudId: number | null = null; // ID del botón que está cargando

  activeTab: number = 0;
  rolesUsuario: number[] = [];
  idEstadoSolicitud: number = 0;
  idTitulosSolicitud: number[] = [];
  idTipoSolicitudActual: number = 0; // o null si prefieres
  idEstadoActual: number = 0; // o null si prefieres
  ultimoEstado: number = 0;


  //Variables para funcionalidad de archivos
  selectedFiles: File[] = [];
  nombresArchivos: string[] = [];
  fileUploaded: boolean = false;
  rutas: { nombreOriginal: string; key: string }[] = [];
  Bucket: string = '';
  Location: string = '';
  loading: boolean = false;
  archivoSubido = false;

  rolesConEnlace: number[] = [3, 4, 7, 8, 9, 24, 25, 27];

  stateOptions = [
    { label: 'Subsanar', value: 'subsanar' },
    { label: 'Dictaminar', value: 'dictaminar' }
  ];

  value: string = 'off';


  minDate: Date | null = null;
  minTime: Date | null = null;
  maxTime: Date | null = null;

  tabActivoIndex: number = 0;
  disabledDays: number[] = [0, 6];

  dialogStyle: any = { width: '70vw' }; // valor inicial

  limiteCaracteres = 1000;
  showError: boolean = false;
  formSubmitted: boolean = false;
  closableDialog = true;

  plantillasPorTipoSolicitud: { [key: number]: { [etapa: number]: number[] } } = {
    5: { 1: [3], 2: [4], 3: [6] },
    6: { 1: [3], 2: [5], 3: [6] },
    10: { 1: [3], 3: [6] }
  };

  ticketSeleccionado: string = '';
  historialVisible = false;
  idSolicitudSeleccionada!: number;



  EstadoForm = new FormGroup({
    idSolicitud: new FormControl('', Validators.required),
    idEstadoSolicitud: new FormControl(''),
  });


  AsignacionForm = new FormGroup({
    idSolicitud: new FormControl('', Validators.required),
    rolesSeleccionados: new FormControl(''),
    ticket: new FormControl(''),
    tipoSolicitud: new FormControl(''),
    nombreSolicitud: new FormControl(''),
  });

  RevisionForm = new FormGroup({
    idSolicitud: new FormControl('', Validators.required),
    ticket: new FormControl(''),
    nombreSolicitud: new FormControl(''),
  });

  FechaForm = new FormGroup({
    idSolicitud: new FormControl('', Validators.required),
    ticket: new FormControl(''),
    nombreSolicitud: new FormControl(''),
    nuevaFechaFinalizacion: new FormControl<Date | null>(null, Validators.required),
  });

  AsignarUsuarioForm = new FormGroup({
    idTipoAsignacion: new FormControl<number | null>(null),
    datosAsignacion: new FormControl(''),
    idSolicitud: new FormControl('', Validators.required),
    fechaFinalizacion: new FormControl(''),
    ticket: new FormControl(''),
    nombreSolicitud: new FormControl(''),
    tipoSolicitud: new FormControl(''),
    idEtapa: new FormControl<number | null>(null),
  });


  MiembrosAsignadosForm = new FormGroup({
    idSolicitud: new FormControl('', Validators.required),
    usuariosJson: new FormControl(''),
    ticket: new FormControl(''),
    nombreSolicitud: new FormControl(''),
    tipoSolicitud: new FormControl(''),
  });

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private SolicitudService: SolicitudService,
    private ComisionService: ComisionService,
    private ArchivoService: ArchivoService,
    private AsignacionService: AsignacionService,
    private MessageService: MessageService,
    public srvHistorial: HistorialService,
    private srvReporte: ReporteService,
    private srvParametro: ParametroService
  ) {

    this.initializeRoles();
    this.initializeUsuario();
    this.initializeMiembros();


    this.AsignarForm = this.fb.group({
      idUsuario: ['', Validators.required],
      correo: [null, [Validators.required]],
      tipoSolicitud: [null, [Validators.required]],
      nombreSolicitud: [null, [Validators.required]],
      ticket: [null, [Validators.required]],
      idSolicitud: [null, [Validators.required]],
      fechaFinalizacion: [null, [Validators.required]],
      idEstadoSolicitud: [null, [Validators.required]],
    });

    this.FormatoForm = new FormGroup({
      ticket: new FormControl(''),
      nombreSolicitud: new FormControl(''),
      tipoSolicitud: new FormControl(''),
      decisionBool: new FormControl(''), // Para guardar si aprueba/corrige (boolean)
      idSolicitud: new FormControl('', Validators.required),
      observacion: new FormControl(
        '',
        [
          Validators.minLength(10),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.,\-@:;()"%#]+$/),
          this.sqlInjectionValidator
        ]
      ),
      estado: new FormControl('') // Para almacenar el estado calculado
    });


    this.DenegarForm = this.fb.group({
      idSolicitud: new FormControl('', Validators.required),
      observacion: new FormControl('', Validators.required),
      ticket: new FormControl(''),
      nombreSolicitud: new FormControl(''),
      correo: new FormControl(''),
      tipoSolicitud: new FormControl(''),
    });

    this.RevisionAsignacionForm = this.fb.group({
      idSolicitud: new FormControl('', Validators.required),
      idEstadoSolicitud: new FormControl(''),
      idEtapa: new FormControl(''),
      idTipoSolicitud: new FormControl(''),
      tipoSolicitud: new FormControl(''),
      ticket: new FormControl(''),
      nombreSolicitud: new FormControl(''),
      observacion: new FormControl(''),
      tipoDictamen: ['off'],
    });
  }

  tipoAsignacion = [
    { id: 2, nombre: 'Jefe de Departamento' },
    { id: 3, nombre: 'Miembros de la Dirección' }
  ];


  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  
  getIconPlantilla(archivo: any): string {
    return this.loadingBtnKey === archivo.keys ? 'pi pi-spin pi-spinner' : 'bi bi-file-earmark-post';
  }

  getIconMaterial(archivo: any): string {
    return this.loadingBtnKey === archivo.keys ? 'pi pi-spin pi-spinner' : 'bi bi-file-earmark-code';
  }

  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 768;
  }
  columnasBase = [
    { campo: 'ticket', nombre: 'Ticket' },
    { campo: 'nombreSolicitud', nombre: 'Nombre de la Solicitud' },
    { campo: 'fechaRegistro', nombre: 'Fecha de Registro' },
  ];

  exportarPDFAdministrativa() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dtAdministrativa,
      this.columnasBase,
      'solicitudes-administrativas-'+this.srvReporte.getFecha(),
      'Reporte de Solicitudes Administrativas'
    );
  }

  exportarPDFCurricular() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dtCurricular,
      this.columnasBase,
      'solicitudes-curriculares-'+this.srvReporte.getFecha(),
      'Reporte de Solicitudes Curriculares'
    );
  }

  exportarPDFEstrategica() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dtEstrategica,
      this.columnasBase,
      'solicitudes-estrategicas-'+this.srvReporte.getFecha(),
      'Reporte de Solicitudes Estratégicas'
    );
  }
  
  exportarExcelAdministrativa() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dtAdministrativa,
      this.columnasBase,
      'solicitudes-administrativas-'+this.srvReporte.getFecha(),
    );
  }

  exportarExcelCurricular() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dtCurricular,
      this.columnasBase,
      'solicitudes-curriculares-'+this.srvReporte.getFecha(),
    );
  }

  exportarExcelEstrategica() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dtEstrategica,
      this.columnasBase,
      'solicitudes-estrategicas-'+this.srvReporte.getFecha(),
    );
  }

  


  ngOnInit(): void {
    this.loadingtable = false;
    this.obtenerPermisos();

    this.cargarSelects();
    this.isMobile = window.innerWidth <= 768;

    const now = new Date();

    if (now.getHours() >= 15) {
      this.minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else {
      this.minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Asegurar que minDate no caiga en sábado o domingo
    while (this.minDate.getDay() === 0 || this.minDate.getDay() === 6) {
      this.minDate.setDate(this.minDate.getDate() + 1);
    }

    this.RevisionAsignacionForm.get('tipoDictamen')?.valueChanges.subscribe(val => {
      if (val === 'subsanar') {
        this.RevisionAsignacionForm.get('observacion')?.setValidators([Validators.required]);
      } else {
        this.RevisionAsignacionForm.get('observacion')?.clearValidators();
      }

      this.RevisionAsignacionForm.get('observacion')?.updateValueAndValidity();
      this.RevisionAsignacionForm.get('observacion')?.setValue(""); // Limpia el campo al cambiar
    });

  }


  //Funcion para mostrar el historial
  mostrarHistorials(idSolicitud: number, ticket: string, idEtapa?: number): void {
    this.loadingHistorial = true;

    this.srvHistorial.getHistorial(idSolicitud, idEtapa).subscribe(data => {
      this.historialEstados = data;
      this.mostrarHistorial = true;
      this.loadingHistorial = false;
      this.nombreTicketSeleccionado = ticket; // asignas el nombre
    });
  }

  mostrarHistorialFila(rowData: any, i: number) {
    this.loadingIndex = i; // activa spinner solo en esa fila

    this.mostrarHistorials(
      this.solicitudSeleccionada?.idSolicitud,
      this.solicitudSeleccionada?.ticket,
      rowData.idEtapa
    );

    const posiblePromesa = this.mostrarHistorials(
      this.solicitudSeleccionada?.idSolicitud,
      this.solicitudSeleccionada?.ticket,
      rowData.idEtapa
    );

    setTimeout(() => (this.loadingIndex = null), 1000);
  }


  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    this.rolesUsuario = roles; // Guardas los roles
    const idObjeto = 4; // El objeto que estás consultando

   if(this.rolesUsuario.some(rol => [23, 24, 25, 26, 27].includes(rol))){
      this.activeTab = 1;
      this.mostrarTabs = false;
      this.cargarSolicitudCurricular();
    } else {
      this.activeTab = 0;
      this.mostrarTabs = true;
      this.cargarSolicitudEstrategicas();
    }

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
  showDialog(dialogType: 'Asignar' | 'Integrante' | 'Revision' | 'Mantener' | 'AsignacionCurricular' | 'RevisionAsignacion' | 'Asignados' | 'Denegar') {
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

  getTextoEstado(idEstado: number, enlace?: string): string {
    const map: { [key: number]: string } = {
      9: 'Plan de Diagnóstico',
      11: 'Plan de Diagnóstico',
      10: 'Plan de Diagnóstico',
      12: 'Plan de Factibilidad',
      14: 'Plan de Factibilidad',
      13: 'Plan de Factibilidad',
      15: 'Plan de Estudio',
      16: 'Plan de Estudio',
      17: 'Plan de Estudio',
      7: 'Planes del Ticket'
    };

    if (!enlace || enlace.trim() === '') {
      return 'Enlace No Disponible';
    }
    return map[idEstado] || 'Enlace No Disponible';
  }



  mostrarFechaFinalizacion() {
    this.mostrarFormularioFecha = true;
    this.mostrarFormularioMiembros = false;
    this.dialogStyle = { width: '60vw' };
  }

  mostrarMiembrosAsignados() {
    this.mostrarFormularioMiembros = true;
    this.mostrarFormularioFecha = false;
    this.dialogStyle = { width: '60vw' };
  }

  // Volver a la tabla
  volverATabla() {
    this.mostrarFormularioFecha = false;
    this.mostrarFormularioMiembros = false;
    this.dialogStyle = { width: '70vw' };
  }

  resetDialogEstado(): void {
    this.mostrarFormularioFecha = false;
    this.mostrarFormularioMiembros = false;
  }

  tieneEstadoSolicitud(id: number): boolean {
    return this.solicitudSeleccionada?.idEstadoSolicitud === id ||
      this.solicitudSeleccionada?.estadosSolicitud?.some(
        (estado: any) => estado.idEstadoSolicitud === id
      );
  }

  getLabelDictamen(): string {
    if (
      this.solicitudSeleccionada?.idEstadoSolicitud === 7 ||
      this.solicitudSeleccionada?.estadosSolicitud?.some((e: any) => e.idEstadoSolicitud === 7)
    ) {
      return 'Dictaminar';
    }

    if (
      this.solicitudSeleccionada?.idEstadoSolicitud === 20 ||
      this.solicitudSeleccionada?.estadosSolicitud?.some((e: any) => e.idEstadoSolicitud === 20)
    ) {
      return 'Aprobar';
    }

    return '';
  }


  verificarLimiteCaracteres() {
    const control = this.DenegarForm.get('observacion');
    if (control && control.value && control.value.length > this.limiteCaracteres) {
      control.setValue(control.value.slice(0, this.limiteCaracteres));
    }
  }

  // Valida si el control es inválido en cualquier form
  isInvalid(formGroup: FormGroup, controlName: string) {
    const control = formGroup.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }


  hideModalDenegar() {
    this.showError = false;
    this.visibleDenegar = false; // Cerrar el modal de revisión
    this.DenegarForm.reset();
    this.nombresArchivos = [];
    this.selectedFiles = [];
    this.visibleDenegar = false;
    this.archivoSubido = false; // Asegúrate de resetear la bandera también
    this.nombresArchivos = [];
    (this.Location = ''), (this.rutas = []), (this.Bucket = '');

    this.loadingDenegar = false; // Rehabilita el botón
    this.loading = false;        // Si usás otro para el archivo

    if (this.uploader) {
      this.uploader.clear(); // correcto
    }
  }

  hideModalRevision() {
    this.showError = false;
    this.visibleDenegar = false; // Cerrar el modal de revisión
    this.RevisionAsignacionForm.reset();
    this.nombresArchivos = [];
    this.selectedFiles = [];
    this.visibleDenegar = false;
    this.archivoSubido = false; // Asegúrate de resetear la bandera también
    this.nombresArchivos = [];
    (this.Location = ''), (this.rutas = []), (this.Bucket = '');

    this.loadingDenegar = false; // Rehabilita el botón
    this.loading = false;        // Si usás otro para el archivo

    if (this.uploader) {
      this.uploader.clear(); // correcto
    }
  }





  // ────────────────────────────────
  // Sección de Gestión de Archivos
  // Métodos para cargar, descargar, seleccionar, enviar y eliminar archivos
  // Incluye manejo de estado y control de interfaz (popover, nombres, rutas)
  // ───────────────────────────────────────────────────────────

  cargarArchivos(event: Event, nombreArchivo: string, key: string, bucket: string): void {
    this.loadingBtnKey = key;

    this.ArchivoService.getArchivos(key, bucket).subscribe(
      (response) => {
        const nombres = nombreArchivo.split(',').map((n) => n.trim());
        this.archivos = response.map((res: any, index: number) => {
          const nombre = nombres[index] ? nombres[index] : `Archivo ${index + 1}`;
          return {
            url: res.data[0].table0[0].url,
            nombre: nombre,
          };
        });
        this.loadingBtnKey = null;

        setTimeout(() => {
          this.filePopover.toggle(event);
        });
      },
      (error) => {
        this.loadingBtnKey = null;
      }
    );
  }

  // Función para descargar un archivo y cambiarle el nombre dinámicamente
  descargarArchivo(url: string, nombre: string) {
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Error al obtener el archivo');
        return response.blob(); // Convertir la respuesta en un blob
      })
      .then(blob => {
        // Crear un objeto URL a partir del blob
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = nombre; // Asignar el nombre deseado
        ////console.log(`Descargando: ${nombre}`); // Verificar el nombre
        a.click();
        URL.revokeObjectURL(blobUrl); // Liberar memoria
        a.remove(); // Eliminar el enlace
      })
      .catch(error => {
        ////console.error('Error al descargar el archivo:', error);
      });
  }

  //*********************************************************************************************************************************************************************** */
  cargarArchivosFormatos(event: Event, nombreArchivo: string, key: string, bucket: string): void {
    this.loadingBtnKey = key;

    this.ArchivoService.getArchivos(key, bucket).subscribe(
      (response) => {
        const nombres = nombreArchivo.split(',').map((n) => n.trim());

        // Crear arreglo de archivos
        this.archivos = response.map((res: any, index: number) => {
          const nombre = nombres[index] ? nombres[index] : `Archivo ${index + 1}`;
          return {
            url: res.data[0].table0[0].url,
            nombre: nombre,
          };
        });

        // 🔹 Descargar automáticamente el primer archivo (plantilla)
        if (this.archivos.length > 0) {
          const archivo = this.archivos[0];
          this.descargarArchivo(archivo.url, archivo.nombre);
        }

        this.loadingBtnKey = null;
      },
      (error) => {
        console.error('Error al cargar archivos:', error);
        this.loadingBtnKey = null;
      }
    );
  }
  //*********************************************************************************************************************************************************************** */

  descargarFormatos(event: Event, idParametros: string): void {
  this.loadingPlantillaId = true;

  this.srvParametro.getPlantillaPorId(idParametros).subscribe(
    (response: any) => {
      const fila: any = Array.isArray(response) && response.length > 0 ? response[0] : response;

      if (!fila) {
        console.warn('Respuesta vacía obtener plantilla');
        this.loadingPlantillaId = false;
        return;
      }

      const nombreArchivo = fila.nombreArchivo ?? fila.nombre_archivo ?? fila.nombre ?? 'archivo.docx';
      const keys = fila.keys ?? fila.key ?? fila.llave ?? fila.idRepositorioArchivo ?? null;
      const bucket = fila.bucket ?? null;

      if (!keys || !bucket) {
        console.error('Faltan keys o bucket en la respuesta de plantilla:', fila);
        this.loadingPlantillaId = false;
        return;
      }

      // 🔹 Cargar archivos y descargar automáticamente
      this.cargarArchivosFormatos(event, nombreArchivo, String(keys), String(bucket));

      this.loadingPlantillaId = false;
    },
    (err) => {
      console.error('Error al obtener plantilla:', err);
      this.loadingPlantillaId = false;
    }
  );
}


  getfiles(event: any): void {
    const files = Array.from(event.files) as File[];
  //console.log({files: files});

    if (files.length === 0) {
      this.archivoSubido = false;
      return;
    }

    let invalidFiles;
    if(this.ultimoEstado !== 32 && this.visibleFormato){
      invalidFiles = files.filter(f =>
        !(
          f.name.toLowerCase().endsWith('.doc') ||
          f.name.toLowerCase().endsWith('.docx')
        )
      );
    } else {
      if(this.ultimoEstado === 32 && this.visibleFormato){
        invalidFiles = files.filter(f => !f.name.toLowerCase().endsWith('.pdf'));
      }
    }

  //console.log({invalidFiles: invalidFiles});
  //console.log({invalidFiles: invalidFiles!.length });
    if (invalidFiles!.length > 0) {
      // Limpia el control visual
      this.selectedFiles = [];
      this.rutas = [];
      this.archivoSubido = false;
    //console.log({files: files});

      // Limpia el array local
      this.archivos = [];

      // Quita el loading
      this.loading = false;

      // Mensaje de advertencia
      this.MessageService.add({
        severity: 'error',
        summary: 'Operación Fallida',
        detail: 'Formato de archivo no válido.',
        life: 3000
      });

      return; // Detiene la ejecución
    } else {
      this.selectedFiles = files;
      this.nombresArchivos = this.selectedFiles.map((file) => file.name);
      this.archivoSubido = true; // Se marca como subido
      this.sendfiles();
    }
  }

  sendfiles(): void {
    this.loading = true;
    this.fileUploaded = false;
    let filesProcessed = 0;
    const totalFiles = this.selectedFiles.length;
    this.selectedFiles.forEach((file, index) => {
      const formData = new FormData();
      formData.append('image', file);

    });
  }

  removeFile(event: any): void {
    const fileToRemove = event.file.name;
    this.loading = false;

    // Filtramos el archivo removido del array
    this.selectedFiles = this.selectedFiles.filter(
      (file) => file.name !== fileToRemove
    );

    // Eliminar la ruta correspondiente del archivo
    this.rutas = this.rutas.filter(
      (item) => item.nombreOriginal !== fileToRemove
    );

    // Validar si ya no hay archivos seleccionados
    this.archivoSubido = this.selectedFiles.length > 0;
  }


  descargarPlantilla(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.target = '_blank';
    link.click();
  }


  getSoloPlantillasPorEtapa(idEtapa: number): any[] {
    const tipo = this.solicitudSeleccionada?.idTipoSolicitud;
    const parametros = this.plantillasPorTipoSolicitud[tipo]?.[idEtapa] || [];
    return this.plantillas.filter(p => parametros.includes(p.idParametro));
  }

  getMaterialEnviadoPorEtapa(idEtapa: number): any[] {
    return this.solicitudSeleccionada?.archivosPlantilla
      ?.filter((a: any) => a.idTipoDocumento === idEtapa)
      ?.sort((a: any, b: any) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()) || [];
  }



  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Métodos para obtener solicitudes estratégicas, curriculares y administrativas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────

  // Método para manejar el cambio de tabs
  onTabChange(event: string | number): void {
    const index = Number(event);
    this.tabActivoIndex = index;
    // Desactiva todos los loaders
    this.loadingtable = false
    this.loadingSolicitudEstrategica = false;
    this.loadingSolicitudCurricular = false;
    this.loadingSolicitudAdministrativa = false;

    // Activa el loader de la pestaña seleccionada y lanza la carga
    switch (index) {
      case 0:
        this.loadingSolicitudEstrategica = true;
        this.cargarSolicitudEstrategicas();
        break;
      case 1:
        this.loadingSolicitudCurricular = true;
        this.cargarSolicitudCurricular();
        break;
      case 2:
        this.loadingSolicitudAdministrativa = true;
        this.cargarSolicitudAdministrativa();
        break;
    }
  }


  cargarSelects(): void {
    // Cargar usuarios
    this.AsignacionService.getUsuarioAsignacion().subscribe(
      (response: any) => {
        this.usuariosTotales = response;
        this.actualizarUsuariosDisponibles(); // Ahora los filtramos ahí
      },
      (error) => {
        //console.error('Error al obtener usuarios', error);
      }
    );

    //Cargar estados de usuario
    this.srvParametro.getPlantilla().subscribe(
      (response: any) => {
        this.plantillas = response;
      },
      (error) => {
        ////console.error('Error al obtener la información', error);
      }
    );
  }

  cargarSolicitudEstrategicas(): void {
    this.loadingSolicitudEstrategica = true;
    this.SolicitudService.getSolicitud().subscribe(
      (response: any[]) => {
        const tieneRol5 = this.rolesUsuario.includes(5);

        this.solicitudEstrategica = response
          .filter((solicitud) => {
            const tipoValido = [1, 3, 4, 24, 25].includes(solicitud.idTipoSolicitud);
            if (!tipoValido) return false;
            if (tieneRol5) return true;
            return solicitud.idEstadoSolicitud !== 1;
          })
          .map((solicitud, index) => {
            // Separar archivos en dos grupos según idTipoArchivo
            const archivosEntrada = solicitud.archivos.filter((a: any) => a.idTipoArchivo === 1);
            const archivosSalida = solicitud.archivos.filter((a: any) => a.idTipoArchivo === 2);

            return {
              numero: index + 1,
              ...solicitud,
              archivosEntrada,
              archivosSalida
            };
          });

        this.mostrarColumnaSalida = this.solicitudEstrategica.some(solicitud =>
          solicitud.archivos.some((archivo: any) => archivo.idTipoArchivo === 2)
        );

        this.loadingSolicitudEstrategica = false;
      },
      (error) => {
        this.loadingSolicitudEstrategica = false;
        this.showErrorMessage(error.error.mensaje);
      }
    );
  }


  cargarSolicitudCurricular(): void {
    this.loadingSolicitudCurricular = true;

    this.SolicitudService.getSolicitudCurricular().subscribe(
      (response: any[]) => {
        // Rol para asistentes operativos de dd idRol = 1, demás unidades idRol = 26
        const tieneRol5 = this.rolesUsuario.some(r => [5, 26].includes(r));
        this.permisoAsignar = tieneRol5;


      //console.log({tieneRol5:tieneRol5})

        this.solicitudCurricular = response
          .filter(solicitud => {
            // Verifica si el tipo de solicitud es válido
            const tipoValido = [5, 6, 10, 11].includes(solicitud.idTipoSolicitud);
            if (!tipoValido) return false;

            // Extrae el primer estado de la solicitud
            const primerEstado = solicitud.estadosSolicitud?.[0];
            if (!primerEstado) return false;

            // Si el primer estado es 1 y el usuario no tiene rol 5, excluir
            if (primerEstado.idEstadoSolicitud === 1 && !tieneRol5) return false;

            return true;
          })
          .map((solicitud, index) => {
            // Separar archivos recientes en entrada y salida
            const archivosEntrada = solicitud.archivosRecientes?.filter((a: any) => a.idTipoArchivo === 1) || [];
            const archivosSalida = solicitud.archivosRecientes?.filter((a: any) => a.idTipoArchivo === 2) || [];

            return {
              numero: index + 1,
              ...solicitud,
              estadoSolicitud: solicitud.estadosSolicitud?.[0] ?? null,
              archivosEntrada,
              archivosSalida,
              archivosPlantilla: solicitud.archivosPlantilla || [],
            };
          });

        // Mostrar columna de salida si hay al menos un archivo de salida
        this.mostrarColumnaSalida = this.solicitudCurricular.some(solicitud =>
          solicitud.archivosSalida && solicitud.archivosSalida.length > 0
        );
        this.mostrarColumnaBorradores = this.solicitudCurricular.some(solicitud =>
          solicitud.archivosBorradores && solicitud.archivosBorradores.length > 0
        );

        this.loadingSolicitudCurricular = false;
      },
      (error) => {
        this.loadingSolicitudCurricular = false;
        this.showErrorMessage(error.error.mensaje);
      }
    );
  }



  cargarSolicitudAdministrativa(): void {
    this.loadingSolicitudAdministrativa = true;
    this.SolicitudService.getSolicitud().subscribe(
      (response: any[]) => {
        const tieneRol5 = this.rolesUsuario.includes(5);

        this.solicitudAdministrativa = response
          .filter((solicitud) => {
            const tipoValido = [7, 8, 9, 12].includes(solicitud.idTipoSolicitud);

            if (!tipoValido) return false;

            if (tieneRol5) return true;

            return solicitud.idEstadoSolicitud !== 1;
          })
          .map((solicitud, index) => {
            // Separar archivos en dos grupos según idTipoArchivo
            const archivosEntrada = solicitud.archivos.filter((a: any) => a.idTipoArchivo === 1);
            const archivosSalida = solicitud.archivos.filter((a: any) => a.idTipoArchivo === 2);

            return {
              numero: index + 1,
              ...solicitud,
              archivosEntrada,
              archivosSalida
            };
          });

        this.mostrarColumnaSalida = this.solicitudAdministrativa.some(solicitud =>
          solicitud.archivos.some((archivo: any) => archivo.idTipoArchivo === 2)
        );

        this.loadingSolicitudAdministrativa = false;
      },
      (error) => {
        this.loadingSolicitudAdministrativa = false;
        this.showErrorMessage(error.error.mensaje);
      }
    );
  }

  // ────────────────────────────────
  // Sección de Manejo de Acciones por Usuario
  // Control de aprobación, denegación y asignación de solicitudes
  // Visualización condicional de botones según roles y estados
  // ────────────────────────────────

  abrirHistorial(idSolicitud: number, ticket: string) {
    this.loadingDialogGeneral = true; // activa spinner

    this.idSolicitudSeleccionada = idSolicitud;
    this.ticketSeleccionado = ticket; // guardamos el ticket
    this.historialVisible = false;

    this.historialHijo.cargarHistorial(idSolicitud);

    this.historialHijo.historialCargado.subscribe(() => {
      this.historialVisible = true;
      this.loadingDialogGeneral = false; // quita spinner cuando termina
    });
  }


  handleAprobar() {
    this.isLoadingAceptar = true;
    this.EstadoForm.patchValue({
      idSolicitud: this.RevisionForm.get('idSolicitud')?.value,
      idEstadoSolicitud: '3'
    });
    this.aprobarTicket();
  }

  handleDenegar() {
    this.isLoadingDenegar = true;
    this.EstadoForm.patchValue({
      idSolicitud: this.RevisionForm.get('idSolicitud')?.value,
      idEstadoSolicitud: '4'
    });
    this.preDenegarTicket();
  }

  handleAsignar() {
    const rolesDepartamento = [7, 8, 9]; // IDs de Coordinadores de Departamento

    const tieneRolDepartamento = this.rolesUsuario.some(rol => rolesDepartamento.includes(rol));

    this.visibleMantener = false;

    if (tieneRolDepartamento) {
      this.visibleAsignacionDepartamento = true;
    } else {
      this.visibleAsignacion = true;
    }
  }

  mostrarBotonEvaluar(solicitud: any): boolean {
    return this.permisoActualizar &&
      (solicitud.idEstadoSolicitud === 2 || solicitud.idEstadoSolicitud === 24) &&
      this.rolesUsuario.includes(solicitud.idRol);
  }

  mostrarBotonEvaluarCurricular(solicitud: any): boolean {
    const primerEstado = solicitud.estadosSolicitud?.[0];
    const rolUsuario = solicitud.idRol;

    return !!(
      this.permisoActualizar &&
      primerEstado &&
      rolUsuario != null &&
      (primerEstado.idEstadoSolicitud === 2 || primerEstado.idEstadoSolicitud === 24) &&
      this.rolesUsuario.includes(rolUsuario)
    );
  }


  mostrarBotonRevision(solicitud: any): boolean {
    if (!this.permisoActualizar) return false;

    const estado = solicitud.idEstadoSolicitud;

    if (estado === 20 && this.rolesUsuario.some(rol => [7, 8, 9, 27].includes(rol))) {
      return true;
    }

    if (estado === 7 && this.rolesUsuario.some(rol => [3, 4, 24, 25].includes(rol))) {
      return true;
    }

    return false;
  }

  tipobotonFormato(solicitud: any): string {
    const ultimoEstado = solicitud.estadosSolicitud?.[solicitud.estadosSolicitud.length - 1]?.idEstadoSolicitud;

    if (ultimoEstado === 29) {
      this.tituloDialogoFormato = 'Subsanar Formato'
      return 'Subsanar Formato';
    } else if (ultimoEstado === 31) {

      this.tituloDialogoFormato = 'Dictaminar Formato'

      return 'Dictaminar Formato';
    } else if (ultimoEstado === 32) {

      this.tituloDialogoFormato = 'Subir Oficio'

      return 'Subir Oficio';
    }
    return '';
  }

mostrarBotonFormato(solicitud: any): boolean {
  if (!this.permisoActualizar) return false;

  const ultimoEstado = solicitud.estadosSolicitud?.[solicitud.estadosSolicitud.length - 1]?.idEstadoSolicitud;

  // Roles 1, 5, 6, 26 pueden ver el botón cuando el estado es 29: Formato de oficio pendiente, o 30: En corrección de Formato
  if ([29, 30, 32].includes(ultimoEstado) && this.rolesUsuario.some(rol => [1, 5, 6, 26].includes(rol))) {
    this.subirArchivo = true;
    return true;
  }

  // Roles 3, 4, 24, 25 pueden ver el botón cuando el estado es 31: En Revision de Formato
  if (ultimoEstado === 31 && this.rolesUsuario.some(rol => [3, 4, 24, 25].includes(rol))) {
    this.subirArchivo = false;
    return true;
  }

  return false;
}

puedeSubirArchivo(): boolean {
  /**
   * Roles de Docencia : 
   * [
   *  {"idRol":5,"rol":"Asistente Operativo"},
   *  {"idRol":6,"rol":"Oficial Administrativo"},
   * ]
   * Roles de demás unidades: 
   * [
   *  {"idRol":26,"rol":"Asistente Curricular (Operativo)"}
   * ]
  **/
  return this.rolesUsuario.some(rol => [5, 6, 26].includes(rol));
}


  sqlInjectionValidator(control: any) {
    if (!control.value) return null;
    const forbidden = /(select|insert|delete|update|drop|alter|create|exec|truncate)/i;
    return forbidden.test(control.value) ? { sqlInjection: true } : null;
  }
  
abrirDialogoFormato(solicitud: any) {
  this.ultimoEstado = solicitud.estadosSolicitud?.[solicitud.estadosSolicitud.length - 1]?.idEstadoSolicitud;
//console.log({ultimoEstado: this.ultimoEstado});
  this.solicitudSeleccionada = solicitud; // 🔹 guardamos la solicitud actual
  this.ticket = solicitud.ticket;
  this.visibleFormato = true;
  this.archivos = [];        // limpiar archivos previos
  this.archivoSubido = false; // reset flag
  this.FormatoForm.reset();   // limpiar formulario de observación
}


  hasObservacion(): boolean {
    const observacion = this.FormatoForm.get('observacion')?.value;
    return !!observacion && observacion.trim().length > 0;
  }

  procesarDecision() {
    const observacion = this.FormatoForm.get('observacion')?.value?.trim();
    const tieneObservacion = !!observacion;
    const roles = this.rolesUsuario || [];

    let nuevoEstado: number | null = null;
    let nuevoEstadoEtapa: number | null = null;

//console.log({ultimoEstado: this.ultimoEstado});

  if (roles.some(rol => [5, 6, 26].includes(rol))) {//Administrativos
    if(this.ultimoEstado === 29){
      nuevoEstado = tieneObservacion ? 30 : 31;
      nuevoEstadoEtapa = tieneObservacion ? 30 : 31;
    } 

    if(this.ultimoEstado === 32){
      nuevoEstado = tieneObservacion ? 30 : 18;
      nuevoEstadoEtapa = tieneObservacion ? 30 : 18;
    }
  } else if (roles.some(rol => [3, 24].includes(rol))) {// Directores
    nuevoEstado = tieneObservacion ? 30 : 32;
    nuevoEstadoEtapa = tieneObservacion ? 30 : 32;
  }

    // Construir los datos de la solicitud
    const solicitudPayload = {
      idSolicitud: this.solicitudSeleccionada.idSolicitud,
      idNuevoEstadoSolicitud: nuevoEstado,
      idNuevoEstadoEtapa: nuevoEstadoEtapa,
      observacion: observacion || ''
    };

  // Construir el FormData (igual que en denegarTicket)
  const formDatas = new FormData();

    // Archivos (solo si no hay observación)
    if (!tieneObservacion && this.selectedFiles?.length > 0) {
      this.selectedFiles.forEach((file: File) => {
        formDatas.append('image', file, file.name);
      });
    }

    // Agregar campos de la solicitud
    Object.entries(solicitudPayload).forEach(([key, value]) => {
      formDatas.append(key, value !== null ? value.toString() : '');
    });

    this.isLoadingFormato = true;

    this.SolicitudService.putDictaminarFormato(solicitudPayload, this.selectedFiles).subscribe({    next: (res: any) => {
      this.isLoadingFormato = false;
      this.visibleFormato = false;
      this.selectedFiles = [];
      this.archivoSubido = false;
      this.FormatoForm.reset();

      if (this.rolesUsuario.some(rol => [23, 24, 25, 26, 27].includes(rol))) {
        this.cargarSolicitudCurricular();
      }

      // refrescar la tabla según el tipo de solicitud
      if (this.tipoSolicitudActual === 'Estrategica') {
        this.cargarSolicitudEstrategicas();
      } else if (this.tipoSolicitudActual === 'Administrativa') {
        this.cargarSolicitudAdministrativa();
      } else if (this.tipoSolicitudActual === 'Curricular') {
        this.cargarSolicitudCurricular();
      }

      this.MessageService.add({
        severity: 'success',
        summary: 'Operación Exitosa',
        detail: res.message || 'Formato procesado correctamente',
        life: 3000
      });
    },
    error: (error: any) => {
      this.isLoadingFormato = false;
      const msg = error.error?.mensaje || 'Error al procesar el formato';
      this.MessageService.add({
        severity: 'error',
        summary: 'Operación Fallida',
        detail: msg,
        life: 3000
      });
    }
    });
}


  formatObservacion(formName: 'FormatoForm') {
    let form = this[formName];
    let texto = form.get('observacion')?.value || '';

    texto = texto
      .toLowerCase()
      .replace(/(^\s*\w|[\.:\;]\s*\w)/g, (c: string) => c.toUpperCase());


    form.get('observacion')?.setValue(texto, { emitEvent: false });
  }

  filtrarObservacion(formName: 'FormatoForm') {
    let control = this[formName].get('observacion');
    let texto = control?.value || '';

    // 1. Quitar caracteres no permitidos
    texto = texto.split('').filter((c: any) => this.permitidos.test(c)).join('');

    // 2. Eliminar palabras prohibidas (SQL)
    texto = texto.replace(this.palabrasProhibidas, '');

    control?.setValue(texto, { emitEvent: false });
  }

  mostrarBotonRevisionCurricular(solicitud: any): boolean {
    if (!this.permisoActualizar) {
      return false;
    }

    const estados = solicitud.estadosSolicitud || [];

    // Mostrar el botón si es interna === false y solo tiene un estado
    if (
      !solicitud.interna &&
      estados.length === 1 &&
      (estados[0].idEstadoSolicitud === 7 || estados[0].idEstadoSolicitud === 20)
    ) {
      return true;
    }
    // Verifica que todos los estados sean 7 o 20
    const todosSonValidos = estados.every(
      (estado: any) => estado.idEstadoSolicitud === 7 || estado.idEstadoSolicitud === 20
    );

    if (!todosSonValidos) {
      return false;
    }

    // Verifica la cantidad de estados en base al tipo de solicitud
    const cantidadEsperada = solicitud.idTipoSolicitud === 10 ? 2 : 3;
    if (estados.length !== cantidadEsperada) {
      return false;
    }

    // Valida roles según los estados
    const contieneEstado20 = estados.some((e: any) => e.idEstadoSolicitud === 20);
    const contieneEstado7 = estados.some((e: any) => e.idEstadoSolicitud === 7);

    if (
      contieneEstado20 &&
      this.rolesUsuario.some(rol => [7, 8, 9, 27].includes(rol))
    ) {
      return true;
    }

    if (
      contieneEstado7 &&
      this.rolesUsuario.some(rol => [3, 4, 24, 25].includes(rol))
    ) {
      return true;
    }

    return false;
  }

  puedeVerEnlace(): boolean {
    return this.rolesUsuario.some(rol => this.rolesConEnlace.includes(rol));
  }


  mostrarBotonMantener(solicitud: any): boolean {
    const rolesEspeciales = [7, 8, 9, 27];
    const rolesPermitidos = [3, 4, 24, 25, ...rolesEspeciales];

    return this.permisoActualizar &&
      (
        (solicitud.idEstadoSolicitud === 3 && this.rolesUsuario.includes(solicitud.idRol) && rolesPermitidos.includes(solicitud.idRol)) ||
        (solicitud.idEstadoSolicitud === 19 && this.rolesUsuario.includes(solicitud.idRol) && rolesEspeciales.includes(solicitud.idRol))
      );
  }


  mostrarBotonMantenerCurricular(solicitud: any): boolean {
    /**
     * Coordinadores de departamento DD: "roles": 7,8,9
     * Coordinadores de otras direcciones: "rol": 27
    **/
    const rolesEspeciales = [7, 8, 9, 27];
    const rolesPermitidos = [3, 4, 24, 25, ...rolesEspeciales];

    const primerEstado = solicitud.estadosSolicitud?.[0];
    if (!this.permisoActualizar || !primerEstado) {
      return false;
    }

    const { idEstadoSolicitud } = primerEstado;
    const rolAsignado = solicitud.idRol;    // ← tiramos del root

    return (
      (idEstadoSolicitud === 3
        && this.rolesUsuario.includes(rolAsignado)
        && rolesPermitidos.includes(rolAsignado)
      )
      || (idEstadoSolicitud === 19
        && this.rolesUsuario.includes(rolAsignado)
        && rolesEspeciales.includes(rolAsignado)
      )
    );
  }


  mostrarBotonDenegar(solicitud: any): boolean {
    const rolesEspeciales = [7, 8, 9, 27];
    const rolesPermitidos = [3, 4, 24, 25,...rolesEspeciales];

    return this.permisoActualizar &&
      (
        (solicitud.idEstadoSolicitud === 4 && this.rolesUsuario.includes(solicitud.idRol) && rolesPermitidos.includes(solicitud.idRol))

      );
  }

  mostrarBotonDenegarCurricular(solicitud: any): boolean {
    const rolesEspeciales = [7, 8, 9, 27];
    const rolesPermitidos = [3, 4, 24, 25, ...rolesEspeciales];

    const primerEstado = solicitud.estadosSolicitud?.[0];
    if (!this.permisoActualizar || !primerEstado) {
      return false;
    }

    const { idEstadoSolicitud } = primerEstado;
    const rolAsignado = solicitud.idRol;

    return (
      (idEstadoSolicitud === 4
        && this.rolesUsuario.includes(rolAsignado)
        && rolesPermitidos.includes(rolAsignado)
      )
    );
  }

  tieneAccionDisponible(solicitud: any): boolean {
    const tieneAsignar = this.permisoActualizar && solicitud.idEstadoSolicitud === 1 && this.rolesUsuario.includes(5);
    const tieneMantener = this.mostrarBotonMantener(solicitud);
    const tieneEvaluar = this.mostrarBotonEvaluar(solicitud);

    return tieneAsignar || tieneMantener || tieneEvaluar;
  }

  puedeVerAcciones(): boolean {
    return this.rolesUsuario.some(rol => this.rolesConPermisosAcciones.includes(rol));
  }

  puedeVerAsignados(): boolean {
    return this.rolesUsuario.some(rol => this.rolesConPermisosAccionesEnlaces.includes(rol));
  }

  mostrarBotonArchivos(solicitud: any): boolean {
    return solicitud.idEstadoSolicitud <= 3 && this.puedeVerAsignados();
  }


  mostrarColumnaAcciones(): boolean {
    return this.puedeVerAcciones() &&
      this.listaSolicitudes?.some(solicitud => this.tieneAccionDisponible(solicitud));
  }

  isFormularioAsignacionValido(): boolean {
    const fecha = this.AsignarUsuarioForm.get('fechaFinalizacion')?.value;
    const formArray = this.UsuarioForm.get('usuarioAsignacion') as FormArray;

    const todosUsuariosAsignados = formArray && formArray.length > 0 && formArray.controls.every(
      ctrl => !!ctrl.get('idUsuario')?.value
    );

    return !!fecha && todosUsuariosAsignados;
  }

  hayUsuarioSeleccionado(): boolean {
    const usuarios = this.UsuarioForm.get('usuarioAsignacion') as FormArray;
    if (!usuarios || usuarios.length === 0) return false;

    // Verifica si al menos un usuario está seleccionado
    return usuarios.controls.some(control => !!control.get('idUsuario')?.value);
  }

  isAsignacionValida(): boolean {
    const tipoAsignacion = this.AsignarUsuarioForm.get('idTipoAsignacion')?.value;
    const fecha = this.AsignarUsuarioForm.get('fechaFinalizacion')?.value;
    const formArray = this.UsuarioForm.get('usuarioAsignacion') as FormArray;

    // Asegura que haya al menos una fila y que todas tengan usuario asignado
    const todosUsuariosAsignados = formArray && formArray.length > 0 && formArray.controls.every(ctrl => {
      return tipoAsignacion === 2
        ? !!ctrl.get('idRol')?.value
        : !!ctrl.get('idUsuario')?.value;
    });

    if (tipoAsignacion === 3) {
      return !!fecha && todosUsuariosAsignados;
    }

    if (tipoAsignacion === 2) {
      return todosUsuariosAsignados;
    }

    return false; // Por defecto, no válido
  }

  hasValidUsuario(): boolean {
    const rolUsuario = this.AsignacionRolForm?.get('rolUsuario') as FormArray;
    return rolUsuario && rolUsuario.length > 0 && rolUsuario.controls.every(control => control.valid);
  }

  getSolicitudesActuales(): any[] {
    switch (this.tabActivoIndex) {
      case 0:
        return this.solicitudEstrategica || [];
      case 1:
        return this.solicitudCurricular || [];
      case 2:
        return this.solicitudAdministrativa || [];
      default:
        return [];
    }
  }

  mostrarBotonHistorial(solicitud: any): boolean {
    // Lógica opcional, si en el futuro quieres condicionar también el historial
    return true; // o alguna condición si aplica
  }

  obtenerClaseBotonEvaluar(solicitud: any): string {
    const seCruzan = this.mostrarBotonEvaluar(solicitud) && this.mostrarBotonHistorial(solicitud);
    return seCruzan ? 'btn fw-bolder custom-1 w-full' : 'btn fw-bolder custom-7 w-full';
  }

  obtenerClaseBotonEvaluarCurricular(solicitud: any): string {
    const seCruzan = this.mostrarBotonEvaluarCurricular(solicitud) && this.mostrarBotonHistorial(solicitud);
    return seCruzan ? 'btn fw-bolder custom-1 w-full' : 'btn fw-bolder custom-7 w-full';
  }

  // ────────────────────────────────
  // Sección de Carga de Datos para Diálogos
  // Integrantes, Asignaciones, Revisiones y Mantención de Solicitudes
  // ────────────────────────────────

  cargarDatos(comision: any, tipo: 'Integrante'): void {
    this.loadingDialogGeneral = true;
    this.loadingSolicitudId = comision.idSolicitud;

    if (tipo === 'Integrante') {
      // Aquí cargarías los integrantes
      this.loadingDialogIntegrante = true;

      this.ComisionService.getIntegrantes(comision.idSubComision, null).subscribe(
        (response: any) => {
          this.integrantes = response.map((integrantes: any, index: number) => ({
            numero: index + 1,
            ...integrantes,
            fechaVencimiento: new Date(integrantes.fechaVencimiento),
          }));
          this.nombreSubComision = comision.nombreSubComision;
          this.loadingDialogGeneral = false;
          this.loadingDialogIntegrante = false;
          this.loadingSolicitudId = null;

          setTimeout(() => {
            this.showDialog(tipo);
          }, 0);
        },
        (error) => {
          this.loadingDialogGeneral = false;
          this.loadingDialogIntegrante = false;
          this.showErrorMessage(error.error.mensaje);
        }
      );

    }
  }

  cargarAsigandosSolicitud(solicitud: any, tipo: 'Asignados', tipoSolicitud: string): void {
    this.loadingDialogGeneral = true;
    this.loadingAsignados = true;  // <--- aquí
    this.tipoSolicitudActual = tipoSolicitud;

    if (tipo === 'Asignados') {
      this.loadingDialogAsignado = true;

      this.AsignacionService.getUsuariosAsignadosTicket(solicitud.idSolicitud).subscribe(
        (response: any) => {
          this.asignado = response.map((asignado: any, index: number) => ({
            numero: index + 1,
            ...asignado,
          }));

          const idUsuarioActual = this.AuthService.getIdUsuario(); // CORRECTO
        //console.log('ID USUARIO ACTUAL (Token):', idUsuarioActual);

          this.esAsignadorActual = this.asignado.some(
            (a: any) => a.idUsuarioAsignador?.toString() === idUsuarioActual?.toString()
          );


          this.ticket = solicitud.ticket;
          this.idTipoSolicitudActual = solicitud.idTipoSolicitud; // <-- aquí

          this.idEstadoActual = 0;

          if (Array.isArray(solicitud.estadosSolicitud) && solicitud.estadosSolicitud.length > 0) {
            // Historial de estados: obtener el último
            
            const ultimoEstado = solicitud.estadosSolicitud[solicitud.estadosSolicitud.length - 1];
            this.idEstadoActual = ultimoEstado.idEstadoSolicitud;
          } else if ('idEstadoSolicitud' in solicitud) {
            // Solicitud con estado directo
            this.idEstadoActual = solicitud.idEstadoSolicitud;
          }

          const primerAsignadoConFecha = this.asignado.find((a: any) => a.fechaFinalizacion != null);
          const fechaFinal = primerAsignadoConFecha ? new Date(primerAsignadoConFecha.fechaFinalizacion) : null;


          this.FechaForm.patchValue({
            idSolicitud: solicitud.idSolicitud,
            ticket: solicitud.ticket,
            nombreSolicitud: solicitud.nombreSolicitud,
            nuevaFechaFinalizacion: fechaFinal,
          });

          this.MiembrosAsignadosForm.patchValue({
            idSolicitud: solicitud.idSolicitud,
            ticket: solicitud.ticket,
            nombreSolicitud: solicitud.nombreSolicitud,
            tipoSolicitud: solicitud.tipoSolicitud,
          });


          this.MiembrosForm.setControl(
            'miembroAsignados',
            this.fb.array(
              this.asignado.map((a: any) =>
                this.fb.group({
                  idUsuario: [a.idUsuario || null],
                })
              )
            )
          );


          this.loadingDialogGeneral = false;
          this.loadingDialogAsignado = false;
          this.loadingAsignados = false;  // <--- aquí

          setTimeout(() => {
            this.showDialog(tipo);
          }, 0);
        },
        (error) => {
          this.loadingDialogGeneral = false;
          this.loadingDialogAsignado = false;
          this.loadingAsignados = false;  // <--- aquí
          this.showErrorMessage(error.error.mensaje);
        }
      );
    }
  }

  cargarAsignaciones(solicitud: any, tipo: 'Asignar' | 'Revision' | 'Mantener' | 'AsignacionCurricular' | 'RevisionAsignacion' | 'Denegar', tipoSolicitud: string): void {
    this.loadingDialogGeneral = true;
    this.tipoSolicitudActual = tipoSolicitud;
    this.solicitudSeleccionada = solicitud;
    this.esSolicitudExterna = !solicitud.interna;

    if (tipo === 'Asignar') {
      this.isLoadingDatosAsignacion = true;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = false;
      this.isLoadingDatosCurricular = false;
      this.isLoadingDatosRevisionAsignacion = false;
      this.isLoadingDatosDenegar = false;
    } else if (tipo === 'Revision') {
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = true;
      this.isLoadingDatosMantener = false;
      this.isLoadingDatosCurricular = false;
      this.isLoadingDatosRevisionAsignacion = false;
      this.isLoadingDatosDenegar = false;
    } else if (tipo === 'Mantener') {
      // Aquí defines el comportamiento para Mantener
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = true; // suponiendo que tienes una variable para manejar carga de mantener
      this.isLoadingDatosCurricular = false;
      this.isLoadingDatosRevisionAsignacion = false;
      this.isLoadingDatosDenegar = false;
    } else if (tipo === 'AsignacionCurricular') {
      // Aquí defines el comportamiento para Mantener
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = false; // suponiendo que tienes una variable para manejar carga de mantener
      this.isLoadingDatosCurricular = true;
      this.isLoadingDatosRevisionAsignacion = false;
      this.isLoadingDatosDenegar = false;
    } else if (tipo === 'RevisionAsignacion') {
      // Aquí defines el comportamiento para Mantener
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = false; // suponiendo que tienes una variable para manejar carga de mantener
      this.isLoadingDatosCurricular = false;
      this.isLoadingDatosRevisionAsignacion = true;
      this.isLoadingDatosDenegar = false;
    } else if (tipo === 'Denegar') {
      // Aquí defines el comportamiento para Mantener
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = false; // suponiendo que tienes una variable para manejar carga de mantener
      this.isLoadingDatosCurricular = false;
      this.isLoadingDatosRevisionAsignacion = false;
      this.isLoadingDatosDenegar = true;
    }

    this.ticket = solicitud.ticket;
    this.nombreSolicitud = solicitud.nombreSolicitud;
    this.tipoSolicitud = solicitud.tipoSolicitud;

    this.AsignacionForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
      tipoSolicitud: solicitud.tipoSolicitud,
    });

    this.RevisionForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
    });

    this.DenegarForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
      tipoSolicitud: solicitud.tipoSolicitud,
      correo: solicitud.correo,
    });

    this.EstadoForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
    });

    this.AsignarUsuarioForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
      tipoSolicitud: solicitud.tipoSolicitud,
    });

    // 🔁 Obtener estado actual de forma segura
    let estadoSolicitud: number | undefined = solicitud.idEstadoSolicitud;

    if (
      (estadoSolicitud === null || estadoSolicitud === undefined) &&
      Array.isArray(solicitud.estadosSolicitud) &&
      solicitud.estadosSolicitud.length > 0
    ) {
      // Puedes cambiar `.at(-1)` por `[0]` si prefieres el primer estado
      estadoSolicitud = solicitud.estadosSolicitud.at(-1).idEstadoSolicitud;
    }

    this.RevisionAsignacionForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
      idEstadoSolicitud: estadoSolicitud !== undefined && estadoSolicitud !== null ? String(estadoSolicitud) : null,
      idTipoSolicitud: solicitud.idTipoSolicitud,
      tipoSolicitud: solicitud.tipoSolicitud,
    });

    this.FechaForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
    });


    this.rolUsuario.clear(); // Limpiamos el array cada vez que abrimos
    this.usuarioAsignacion.clear();

    setTimeout(() => {
      this.loadingDialogGeneral = false;
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = false;
      this.isLoadingDatosCurricular = false;
      this.isLoadingDatosDenegar = false;
      this.isLoadingDatosRevisionAsignacion = false;


      setTimeout(() => {
        this.showDialog(tipo);
      }, 0);
    }, 300);
  }

  cargarAsignacionesCurricular(solicitud: any, tipo: 'Asignar' | 'Revision' | 'Mantener' | 'AsignacionCurricular', tipoSolicitud: string): void {
    this.loadingDialogGeneral = true;
    this.tipoSolicitudActual = tipoSolicitud;

    if (tipo === 'Asignar') {
      this.isLoadingDatosAsignacion = true;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = false;
      this.isLoadingDatosCurricular = false;
    } else if (tipo === 'Revision') {
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = true;
      this.isLoadingDatosMantener = false;
      this.isLoadingDatosCurricular = false;
    } else if (tipo === 'Mantener') {
      // Aquí defines el comportamiento para Mantener
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = true; // suponiendo que tienes una variable para manejar carga de mantener
      this.isLoadingDatosCurricular = false;
    } else if (tipo === 'AsignacionCurricular') {
      // Aquí defines el comportamiento para Mantener
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = false; // suponiendo que tienes una variable para manejar carga de mantener
      this.isLoadingDatosCurricular = true;

    } else if (tipo === 'RevisionAsignacion') {
      // Aquí defines el comportamiento para Mantener
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = false; // suponiendo que tienes una variable para manejar carga de mantener
      this.isLoadingDatosCurricular = false;
      this.isLoadingDatosRevisionAsignacion = true;
    }

    this.ticket = solicitud.ticket;
    this.nombreSolicitud = solicitud.nombreSolicitud;
    this.tipoSolicitud = solicitud.tipoSolicitud;
    this.esSolicitudExterna = solicitud.interna === false;

    this.AsignacionForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
      tipoSolicitud: solicitud.tipoSolicitud,
    });

    this.RevisionForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
    });

    this.DenegarForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
      tipoSolicitud: solicitud.tipoSolicitud,
      correo: solicitud.correo,
    });

    this.EstadoForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
    });

    this.AsignarUsuarioForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
      tipoSolicitud: solicitud.tipoSolicitud,
    });

    let estadoSolicitud: number | undefined = solicitud.idEstadoSolicitud;
    if (
      (estadoSolicitud === null || estadoSolicitud === undefined) &&
      Array.isArray(solicitud.estadosSolicitud) &&
      solicitud.estadosSolicitud.length > 0
    ) {
      // Puedes cambiar `.at(-1)` por `[0]` si prefieres el primer estado
      estadoSolicitud = solicitud.estadosSolicitud.at(-1).idEstadoSolicitud;
    }

    this.RevisionAsignacionForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
      idEstadoSolicitud: estadoSolicitud !== undefined && estadoSolicitud !== null ? String(estadoSolicitud) : null,
      tipoSolicitud: solicitud.tipoSolicitud,
    });

    this.FechaForm.patchValue({
      idSolicitud: solicitud.idSolicitud,
      ticket: solicitud.ticket,
      nombreSolicitud: solicitud.nombreSolicitud,
    });

    this.rolUsuario.clear(); // Limpiamos el array cada vez que abrimos
    this.usuarioAsignacion.clear();

    this.idTitulosSolicitud = [];
    if (solicitud.idTituloAcademico) {
      this.idTitulosSolicitud = solicitud.idTituloAcademico
        .toString()
        .split(',')
        .map((id: string) => +id.trim());
    }

    // 🎯 Agregar una fila y autoseleccionar usuario
    if (tipo === 'AsignacionCurricular') {
      this.addRow(2); // Agregar fila para usuario

      // Esperar a que se complete el ciclo de detección de cambios
      setTimeout(() => {
        if (this.usuarioAsignacion.controls.length > 0) {
          this.autoseleccionarUsuarioPorTitulo(this.usuarioAsignacion.controls[0]);
        }
      }, 100);
    }


    setTimeout(() => {
      this.loadingDialogGeneral = false;
      this.isLoadingDatosAsignacion = false;
      this.isLoadingDatosRevision = false;
      this.isLoadingDatosMantener = false;
      this.isLoadingDatosCurricular = false;
      this.isLoadingDatosRevisionAsignacion = false;
      this.isLoadingDatosDenegar = false;

      setTimeout(() => {
        this.showDialog(tipo);
      }, 0);
    }, 300);
  }

  // Función para mostrar el estado y etapa
  mostrarDetalleEstados(item: any) {
    this.loadingEtapa = true; // activa spinner

    // Simular un pequeño delay para representar carga
    setTimeout(() => {
      this.estadosSeleccionados = item.estadosSolicitud || [];
      this.solicitudSeleccionada = item;
      this.visibleEtapas = true; // mostrar el modal
      this.loadingEtapa = false; // desactiva spinner
    },); // ajusta el tiempo según necesidad
  }


  mostrarInformacionSolicitud(solicitud: any): void {
    this.loadingInformacion = true
    this.solicitudSeleccionada = solicitud
    this.ticket = solicitud.ticket || "Sin ticket"

    // Simular carga de datos adicionales si es necesario
    setTimeout(() => {
      this.visibleInformacion = true
      this.loadingInformacion = false
    }, 500)
  }

  // Función para cerrar el diálogo
  cerrarDialogoInformacion(): void {
    this.visibleInformacion = false
    this.solicitudSeleccionada = null
    this.ticket = ""
  }

  // Función para formatear fecha
  formatearFecha(fecha: any): string {
    if (!fecha) return "No proporcionado"
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }



  // ────────────────────────────────
  // Sección de Gestión Dinámica de Formularios
  // Inicialización y Manipulación de Roles y Asignaciones de Usuario
  // ────

  initializeRoles() {
    this.AsignacionRolForm = this.fb.group({
      rolUsuario: this.fb.array([])
    });
  }

  initializeUsuario() {
    this.UsuarioForm = this.fb.group({
      usuarioAsignacion: this.fb.array([])
    });
  }

  initializeMiembros() {
    this.MiembrosForm = this.fb.group({
      miembroAsignados: this.fb.array([])
    });
  }

  get rolUsuario(): FormArray {
    return this.AsignacionRolForm.get('rolUsuario') as FormArray;
  }

  get usuarioAsignacion(): FormArray {
    return this.UsuarioForm.get('usuarioAsignacion') as FormArray;
  }

  get miembroAsignados(): FormArray {
    return this.MiembrosForm.get('miembroAsignados') as FormArray;
  }

  // Método para agregar filas a las tablas de formación, redes, software y líneas de investigación
  addRow(tabla: number) {
    if (tabla === 1) {
      const RolGroup = this.fb.group({
        idRol: [{ value: '', disabled: this.isLoadingAsignacion }, Validators.required],
        correo: [{ value: '', disabled: this.isLoadingAsignacion }],
      });

      RolGroup.get('idRol')?.valueChanges.subscribe(idRolSeleccionado => {
        const usuario = this.usuariosTotales.find(u => u.idRol === idRolSeleccionado);
        RolGroup.get('correo')?.setValue(usuario?.correo || '');
      });

      this.rolUsuario.push(RolGroup);

    } if (tabla === 2) {
      const group = this.fb.group({
        idUsuario: [null, Validators.required],  // Inicializamos en null
        idRol: [null],                            // Se llenará automáticamente según el usuario
        correo: ['']
      });

      // Cuando el usuario cambia
      // Cuando el usuario cambia
      group.get('idUsuario')?.valueChanges.subscribe(idUsuarioSeleccionado => {
        if (idUsuarioSeleccionado) {
          // Filtramos todos los roles del usuario
          // Filtramos todos los roles del usuario
          const usuario = this.usuariosTotales.find(u => u.idUsuario === idUsuarioSeleccionado);
          group.get('idRol')?.setValue(usuario?.idRol || null);  // Asigna el rol automáticamente
          group.get('idRol')?.setValue(usuario?.idRol || null);  // Asigna el rol automáticamente
          group.get('correo')?.setValue(usuario?.correo || '');
        } else {
          group.get('idRol')?.setValue(null);
          group.get('idRol')?.setValue(null);
          group.get('correo')?.setValue('');

        }
      });

      this.usuarioAsignacion.push(group);

    } else if (tabla === 3) {
      const group = this.fb.group({
        idUsuario: ['', Validators.required]
      });
      this.miembroAsignados.push(group);
      this.refrescarOpcionesUsuarios();
    }
  }

  // Quitar filas de las tablas de formación, redes, software y líneas de investigación
  removeRow(index: number, tabla: number): void {
    if (tabla === 1) {
      if (this.isLoadingAsignacion) return;
      if (this.rolUsuario.length > 0) {
        this.rolUsuario.removeAt(index); // Eliminar una fila de formación
      }
    } else if (tabla === 2) {
      if (this.usuarioAsignacion.length > 0) {
        this.usuarioAsignacion.removeAt(index); // Eliminar una fila de software
      }
    } else if (tabla === 3) {
      if (this.miembroAsignados.length > 0) {
        this.miembroAsignados.removeAt(index);
        this.refrescarOpcionesUsuarios();
      }
    }
  }


  refrescarOpcionesUsuarios() {
    this.miembroAsignados.controls.forEach(control => {
      const currentValue = control.get('idUsuario')?.value;
      control.get('idUsuario')?.setValue(null);
      control.get('idUsuario')?.setValue(currentValue);
    });
  }

  // ────────────────────────────────
  // Sección de Lógica de Asignación de Usuarios
  // Filtrado Dinámico según Roles y Contexto de Asignación
  // ────────────────────────────────
  actualizarUsuariosDisponibles() {
    const rolesPermitidos = [4, 5, 7, 8, 9];
    const idsSeleccionados = this.rolUsuario.controls.map(control => control.get('idUsuario')?.value);

    this.usuariosDisponibles = this.usuariosTotales.filter(usuario =>
      rolesPermitidos.includes(usuario.idRol) &&
      !idsSeleccionados.includes(usuario.idUsuario)
    );
  }

  getUsuariosDisponiblesRevision(row: AbstractControl) {
    const idSeleccionado = row.get('idRol')?.value;

    /**
     * Roles para usuarios con rol de director, y rol de asistente tecnico
     * Roles de docencia: [
     *    {
     *      "idRol": 3,
     *      "rol": "Director"
     *    },
     *    {
     *      "idRol": 4,
     *      "rol": "Asistente Técnico Estratégico"
     *    },
     * ]
     * Roles demás unidades: {
     *    {
     *      "idRol": 24,
     *      "rol": "Director Curricular"
     *    },
     *    {
     *      "idRol": 25,
     *      "rol": "Asistente de Dirección"
     *    },
     * ]
    **/
    const rolesPermitidos: number[] = [3, 4, 24, 25]; 

    return this.usuariosTotales.filter(usuario => {
      const yaSeleccionadoEnOtro = this.rolUsuario.controls.some(control =>
        control !== row && control.get('idRol')?.value === usuario.idRol
      );

      const esElSeleccionado = usuario.idRol === idSeleccionado;
      const tieneRolPermitido = rolesPermitidos.includes(usuario.idRol);

      return tieneRolPermitido && (!yaSeleccionadoEnOtro || esElSeleccionado);
    });
  }

  getUsuariosDisponiblesAsignacion(row: AbstractControl) {
    let rolesPermitidos: number[] = [];

    const tipoAsignacionRaw = this.AsignarUsuarioForm.get('idTipoAsignacion')?.value;
    const tipoAsignacion = Number(tipoAsignacionRaw);

    // Definir roles permitidos según tipoAsignacion
    if (tipoAsignacion === 2) {
      rolesPermitidos = [7, 8, 9, 27];
    } else if (tipoAsignacion === 3) {
      /**
       * 
       */
      rolesPermitidos = [4, 5, 6, 7, 8, 9, 14, 15, 16, 23]; // Incluimos todos los roles necesarios
    }

    // Valor seleccionado actualmente en la fila
    const idSeleccionado = row.get('idRol')?.value ?? row.get('idUsuario')?.value;

    const resultado = this.usuariosTotales.filter(usuario => {
      const yaSeleccionadoEnOtro = this.usuarioAsignacion.controls.some(control =>
        control !== row && (
          control.get('idRol')?.value === usuario.idRol ||
          control.get('idUsuario')?.value === usuario.idUsuario
        )
      );

      const esElSeleccionado = usuario.idRol === idSeleccionado || usuario.idUsuario === idSeleccionado;

      // Para tipoAsignacion 3, permitimos todos los usuarios que tengan idUsuario
      const tieneRolPermitido = tipoAsignacion === 3 ? true : rolesPermitidos.includes(usuario.idRol);


      return tieneRolPermitido && (!yaSeleccionadoEnOtro || esElSeleccionado);
    });


    return resultado;
  }

  getUsuariosDisponiblesAsignacionDepartamento(row: AbstractControl) {
    const idSeleccionado = row.get('idUsuario')?.value;

    const rolesRelacionados: Record<number, number> = {
      7: 14,
      8: 15,
      9: 16,
    };

    // Obtener todos los roles relacionados según los roles del usuario logueado
    const rolesPermitidos = this.rolesUsuario
      .map(rol => rolesRelacionados[rol])
      .filter((rol): rol is number => rol !== undefined);

    // Si no tiene roles especiales, no mostrar nada
    if (rolesPermitidos.length === 0) {
      return [];
    }

    return this.usuariosTotales.filter(usuario => {
      const yaSeleccionadoEnOtro = this.rolUsuario.controls.some(control =>
        control !== row && control.get('idRol')?.value === usuario.idRol
      );

      const esElSeleccionado = usuario.idRol === idSeleccionado;

      const tieneRolPermitido = rolesPermitidos.includes(usuario.idRol);

      return tieneRolPermitido && (!yaSeleccionadoEnOtro || esElSeleccionado);
    });
  }

  getUsuariosReasignacion(row: AbstractControl) {
    const rolesPermitidos: number[] = [3, 4, 7, 8, 9, 14, 15, 16, 23, 24, 25, 27];
    const idUsuarioActual = row.get('idUsuario')?.value;

    const usuariosSeleccionados = new Set(
      this.miembroAsignados.controls
        .filter(control => control !== row)
        .map(control => control.get('idUsuario')?.value)
        .filter(id => id != null)
    );

    const usuariosAsignadosEnFormulario = new Set(
      this.miembroAsignados.controls
        .map(control => control.get('idUsuario')?.value)
        .filter(id => id != null)
    );

    const usuariosYaAsignados = new Set(
      this.asignado.map((a: any) => a.idUsuario)
    );

    let usuarios = this.usuariosTotales.filter(usuario => {
      const tieneRolPermitido = rolesPermitidos.includes(usuario.idRol);
      const estaSeleccionadoEnOtraFila = usuariosSeleccionados.has(usuario.idUsuario);
      const yaAsignadoYSeleccionado = usuariosYaAsignados.has(usuario.idUsuario) && usuariosAsignadosEnFormulario.has(usuario.idUsuario);
      const esElActual = usuario.idUsuario === idUsuarioActual;

      return tieneRolPermitido &&
        (!estaSeleccionadoEnOtraFila) &&
        (!yaAsignadoYSeleccionado || esElActual);
    });

    if (idUsuarioActual && !usuarios.some(u => u.idUsuario === idUsuarioActual)) {
      const asignado = this.asignado.find(a => a.idUsuario === idUsuarioActual);
      if (asignado) {
        usuarios.push({
          idUsuario: asignado.idUsuario,
          nombreCompleto: asignado.nombreAsignado,
          idRol: null
        });
      }
    }

    return usuarios;
  }

  // 1. Primero, extrae la lógica de autoselección a una función separada
  private autoseleccionarUsuarioPorTitulo(rowControl: AbstractControl): void {
    const idUsuarioActual = rowControl.get('idUsuario')?.value;

    // Solo autoseleccionar si no hay usuario ya seleccionado
    if (idUsuarioActual) return;

    const rolesPermitidos: number[] = [3, 4, 7, 8, 9, 14, 15, 16, 23, 24, 25, 27];

    // Obtener usuarios disponibles (sin los ya seleccionados)
    const usuariosDisponibles = this.usuariosTotales.filter(usuario => {
      const yaSeleccionado = this.usuarioAsignacion.controls.some(control =>
        control !== rowControl && (
          control.get('idRol')?.value === usuario.idRol ||
          control.get('idUsuario')?.value === usuario.idUsuario
        )
      );

      return rolesPermitidos.includes(usuario.idRol) && !yaSeleccionado;
    });

    // Buscar usuario con título académico relacionado
    for (const usuario of usuariosDisponibles) {
      if (!usuario.idTituloAcademico) continue;

      const titulosUsuario = usuario.idTituloAcademico
        .split(',')
        .map((id: string) => +id.trim());

      const tieneTituloRelacionado = titulosUsuario.some((id: number) =>
        this.idTitulosSolicitud.includes(id)
      );

      if (tieneTituloRelacionado) {
      //console.log('Autoseleccionando usuario:', usuario.nombreCompleto);
        rowControl.get('idUsuario')?.setValue(usuario.idUsuario);
        rowControl.get('idRol')?.setValue(usuario.idRol);
        break;
      }
    }
  }

  // 2. Modifica getUsuariosAsignacionCurricular para solo filtrar
  getUsuariosAsignacionCurricular(row: AbstractControl) {
    /**
     * Roles esternos de Dirección de Docencia: [
     *  {"idRol": 23, "rol":	"Espacialista Gestión Curricular"},
     *  {"idRol": 24, "rol":	"Director Curricular"},
     *  {"idRol": 25, "rol": Asistente de Dirección},
     *  {"idRol": 27, "rol": Coordinador de de Departamento Curricular}
     * ]
     * *** LOS DEMÁS ROLES CORRESPONDEN A DIRECCIÓN DE DOCENCIA
     * [
     *  {"idRol":3, "rol":"Director"},  
     *  {"idRol":4, "rol":"Asistente Técnico Estratégico"},
     *  {"idRol":7,"rol":"Coordinador del Departamento de Gestión de la Práctica Educativa"},
     *  {"idRol":8,"rol":"Coordinador del Departamento de Evaluación Curricular"},
     *  {"idRol":9,"rol":"Coordinador del Departamento de Diseño y Actualización Curricular"},
     *  {"idRol":14,"rol":"Especialista del Departamento de Gestión de la Práctica Educativa"},
     *  {"idRol":15,"rol":"Especialista del Departamento de Evaluación Curricular"},
     *  {"idRol":16,"rol":"Especialista del Departamento de Diseño y Actualización Curricular"}
     * ]
    **/
    const rolesPermitidos: number[] = [3, 4, 7, 8, 9, 14, 15, 16, 23, 24, 25, 27];
    const idSeleccionado = row.get('idRol')?.value ?? row.get('idUsuario')?.value;

    const usuarios = this.usuariosTotales.filter(usuario => {
      const yaSeleccionadoEnOtro = this.usuarioAsignacion.controls.some(control =>
        control !== row && (
          control.get('idRol')?.value === usuario.idRol ||
          control.get('idUsuario')?.value === usuario.idUsuario
        )
      );

      const esElSeleccionado = usuario.idRol === idSeleccionado || usuario.idUsuario === idSeleccionado;
      const tieneRolPermitido = rolesPermitidos.includes(usuario.idRol);

      return tieneRolPermitido && (!yaSeleccionadoEnOtro || esElSeleccionado);
    });

    return usuarios;
  }

  agregarFilasAsignacionAutomatica() {
    const rolesPermitidos: number[] = [3, 4, 7, 8, 9, 14, 15, 16, 23, 24, 25, 27];

    const usuariosRelacionados = this.usuariosTotales.filter(usuario => {
      const titulosUsuario = usuario.idTituloAcademico?.split(',').map((id: string) => +id) || [];
      const tieneTituloRelacionado = titulosUsuario.some((id: number) =>
        this.idTitulosSolicitud.includes(id)
      );
      return tieneTituloRelacionado && rolesPermitidos.includes(usuario.idRol);
    });

    if (usuariosRelacionados.length === 0) {
      // Si no hay coincidencias, agregar una fila vacía (para que el usuario seleccione)
      this.addRow(2);
    } else {
      usuariosRelacionados.forEach(usuario => {
        const group = this.fb.group({
          idRol: [usuario.idRol],
          idUsuario: [usuario.idUsuario]
        });
        this.usuarioAsignacion.push(group);
      });
    }
  }




  // ────────────────────────────────
  // Sección de Funciones para Integración con servicios Backend (APIs)
  // Asignación, aprobación, y denegación de solicitudes
  // ────────────────────────────────
  asignarRevisionSolicitud(): void {
    this.isLoadingAsignacion = true;
    this.closableDialog = false;
    const formData = this.AsignacionForm;
    const formDataValue = formData.value;

    let RolesJSON = '';
    if (this.rolUsuario.value && Array.isArray(this.rolUsuario.value) && this.rolUsuario.value.length > 0) {
      RolesJSON = JSON.stringify(this.rolUsuario.value);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Operación Fallida',
        detail: 'Los roles son requeridos.',
        life: 3000
      });
      this.isLoadingAsignacion = false;
      return;
    }

    const data = {
      ...formDataValue,
      rolesSeleccionados: RolesJSON,
    };

    this.rolUsuario.controls.forEach(control => {
      control.get('idRol')?.disable();
    });


    this.AsignacionService.putAsignarRevisionSolicitud(data).subscribe(
      () => {
        this.visibleAsignar = false;
        this.isLoadingAsignacion = false;
        this.AsignacionForm.reset();
        this.AsignacionRolForm.reset();
        this.closableDialog = true;

        if (this.tipoSolicitudActual === 'Estrategica') {
          this.cargarSolicitudEstrategicas();
        } else if (this.tipoSolicitudActual === 'Administrativa') {
          this.cargarSolicitudAdministrativa(); // Asegúrate de tener este método implementado
        } else if (this.tipoSolicitudActual === 'Curricular') {
          this.cargarSolicitudCurricular(); // Asegúrate de tener este método implementado
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'La solicitud ha sido asignada para su revisión.',
          life: 3000
        });

        this.rolUsuario.controls.forEach(control => {
          control.get('idRol')?.enable();
        });

      },
      error => {
        this.isLoadingAsignacion = false;
        this.closableDialog = true;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al procesar la solicitud.',
          life: 3000
        });

        this.rolUsuario.controls.forEach(control => {
          control.get('idRol')?.enable();
        });

      }
    );
  }

  denegarTicket() {
    this.loadingDenegar = true;
    this.closableDialog = false;
    const formdata = this.DenegarForm.value;

    const formDatas = new FormData();
    this.selectedFiles.forEach(file => {
      formDatas.append('image', file, file.name);
    });

    // Agregar campos del formulario
    for (const key in formdata) {
      if (formdata.hasOwnProperty(key)) {
        formDatas.append(key, formdata[key]);
      }
    }

    this.DenegarForm.get('observacion')?.disable();


    // Llamar al servicio para insertar usuario y persona
    this.SolicitudService.putDenegarSolicitud(formDatas).subscribe(
      (res: any) => {
        this.DenegarForm.reset();

        this.loadingDenegar = false;
        this.nombresArchivos = [];
        this.selectedFiles = [];
        this.visibleDenegar = false;
        this.archivoSubido = false; // Asegúrate de resetear la bandera también
        this.nombresArchivos = [];
        (this.Location = ''), (this.rutas = []), (this.Bucket = '');

        if (this.tipoSolicitudActual === 'Estrategica') {
          this.cargarSolicitudEstrategicas();
        } else if (this.tipoSolicitudActual === 'Administrativa') {
          this.cargarSolicitudAdministrativa(); // Asegúrate de tener este método implementado
        } else if (this.tipoSolicitudActual === 'Curricular') {
          this.cargarSolicitudCurricular(); // Asegúrate de tener este método implementado
        }
        this.DenegarForm.get('observacion')?.enable(); // reactivar si falla
        this.closableDialog = true;
        // Mostrar mensaje de éxito
        this.MessageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Ticket denegado',
          life: 3000
        });
      },
      (error: any) => {
        this.loadingDenegar = false;
        this.DenegarForm.get('observacion')?.enable(); // reactivar si falla
        this.closableDialog = true;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al denegar el ticket';
        this.MessageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  aprobarTicket() {
    const estado = this.EstadoForm.value;
    this.isLoadingAceptar = true;
    this.closableDialog = false;

    this.SolicitudService.putEstado(estado).subscribe(
      (response) => {

        this.visibleRevision = false;

        // 🔥 SOLUCIÓN SIMPLE: Reutilizar cargarAsignacionesCurricular
        if (this.tipoSolicitudActual === 'Curricular') {
          const idSolicitud = this.RevisionForm.get('idSolicitud')?.value;
          const solicitudActual = this.solicitudCurricular?.find(s => s.idSolicitud === idSolicitud);

          if (solicitudActual) {
            // 🎯 Reutilizar la función existente
            this.cargarAsignacionesCurricular(solicitudActual, 'AsignacionCurricular', 'Curricular');
          } else {
            this.visibleAsignacionCurricular = true;
            this.visibleMantener = false;
          }
        } else {
          this.visibleMantener = true;
          this.visibleAsignacionCurricular = false;
        }

        // Mensaje de éxito y lógica de carga
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket Aprobado' });
        this.EstadoForm.reset();
        this.isLoadingAceptar = false;
        this.closableDialog = true;

        if (this.tipoSolicitudActual === 'Estrategica') {
          this.cargarSolicitudEstrategicas();
        } else if (this.tipoSolicitudActual === 'Administrativa') {
          this.cargarSolicitudAdministrativa();
        } else if (this.tipoSolicitudActual === 'Curricular') {
          this.cargarSolicitudCurricular();
        }
      },
      (error) => {
        this.visibleMantener = false;
        this.visibleRevision = true;
        this.visibleAsignacionCurricular = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al aprobar el Ticket' });
        this.isLoadingAceptar = false;
        this.closableDialog = true;
      }
    );
  }

  preDenegarTicket() {
    const estado = this.EstadoForm.value;
    this.isLoadingDenegar = true;
    this.closableDialog = false;
    this.SolicitudService.putEstado(estado).subscribe(
      (response) => {
        // Lógica de visibilidad según tipo de solicitud
        this.visibleDenegar = true;
        this.visibleRevision = false;

        // Mensaje de éxito y lógica de carga
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket Denegado' });
        this.EstadoForm.reset();
        this.isLoadingDenegar = false;
        this.closableDialog = true;

        if (this.tipoSolicitudActual === 'Estrategica') {
          this.cargarSolicitudEstrategicas();
        } else if (this.tipoSolicitudActual === 'Administrativa') {
          this.cargarSolicitudAdministrativa();
        } else if (this.tipoSolicitudActual === 'Curricular') {
          this.cargarSolicitudCurricular();
        }
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al denegar el Ticket' });
        this.isLoadingDenegar = false;
        this.closableDialog = true;
      }
    );
  }

  asignarSolicitudUsuario(): void {
    this.isLoadingAsignacionUsuario = true;
    this.closableDialog = false;
    const tipoAsignacion = this.AsignarUsuarioForm.get('idTipoAsignacion')?.value ?? 1;

    // Setear el valor en el formulario (opcional)
    this.AsignarUsuarioForm.get('idTipoAsignacion')?.setValue(tipoAsignacion);

    const formDataValue = this.AsignarUsuarioForm.value;
    const usuarioAsignacionValue = this.usuarioAsignacion.getRawValue(); // <--- aquí

    let UsuarioJSON = '';

    // Validación condicional: si tipoAsignacion es distinto de 1, entonces usuarios son obligatorios
    if (tipoAsignacion !== 1) {
      if (usuarioAsignacionValue && Array.isArray(usuarioAsignacionValue) && usuarioAsignacionValue.length > 0) {
        UsuarioJSON = JSON.stringify(usuarioAsignacionValue);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: 'Los usuarios son requeridos.',
          life: 3000
        });
        this.isLoadingAsignacionUsuario = false;
        this.closableDialog = true;
        return;
      }
    }
    this.AsignarUsuarioForm.disable();
    this.UsuarioForm.disable();

    const data = {
      ...formDataValue,
      datosAsignacion: UsuarioJSON,
    };

  //console.log('Datos que se enviarán al backend:', data); // <--- Aquí

  //console.log('Datos que se enviarán al backend:', data); // <--- Aquí

    // Resto igual...
    this.AsignacionService.putAsignarSolicitudUsuario(data).subscribe(
      () => {
        this.visibleMantener = false;
        this.visibleAsignacion = false;
        this.isLoadingAsignacionUsuario = false;
        this.visibleAsignacionDepartamento = false;
        this.visibleAsignacionCurricular = false;
        this.AsignarUsuarioForm.reset();
        this.UsuarioForm.reset();

        switch (this.tipoSolicitudActual) {
          case 'Estrategica':
            this.cargarSolicitudEstrategicas();
            break;
          case 'Administrativa':
            this.cargarSolicitudAdministrativa();
            break;
          case 'Curricular':
            this.cargarSolicitudCurricular();
            break;
        }

        this.closableDialog = true;
        this.AsignarUsuarioForm.enable();   // 🔓 Vuelve a habilitar
        this.UsuarioForm.enable();

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Ticket asignado correctamente.',
          life: 3000
        });
      },
      error => {
        this.isLoadingAsignacionUsuario = false;
        this.closableDialog = true;
        this.AsignarUsuarioForm.enable();   // 🔓 Vuelve a habilitar
        this.UsuarioForm.enable();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al asignar el ticket.',
          life: 3000
        });
      }
    );
  }

  asignarSolicitudUsuarioDepartamento(): void {
    this.isLoadingAsignacionUsuario = true;
    this.closableDialog = false;

    // Forzar que idTipoAsignacion siempre sea 3
    const tipoAsignacion = 3;
    this.AsignarUsuarioForm.get('idTipoAsignacion')?.setValue(tipoAsignacion);

    // 🔹 Capturar los valores antes de deshabilitar
    const formDataValue = this.AsignarUsuarioForm.value;
    const usuarioAsignacionValue = this.usuarioAsignacion.getRawValue(); // <--- Aquí usamos getRawValue()

    let UsuarioJSON = '';

    // Validación: usuarios obligatorios para tipoAsignacion 3
    if (usuarioAsignacionValue && Array.isArray(usuarioAsignacionValue) && usuarioAsignacionValue.length > 0) {
      UsuarioJSON = JSON.stringify(usuarioAsignacionValue);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Operación Fallida',
        detail: 'Los usuarios son requeridos.',
        life: 3000
      });
      this.isLoadingAsignacionUsuario = false;
      this.closableDialog = true;
      this.AsignarUsuarioForm.enable();
      this.UsuarioForm.enable();
      return;
    }

    // 🔹 Deshabilitar formularios después de capturar los valores
    this.AsignarUsuarioForm.disable();
    this.UsuarioForm.disable();

    const data = {
      ...formDataValue,
      datosAsignacion: UsuarioJSON,
    };

  //console.log('Datos a enviar al backend:', data); // Depuración

    this.AsignacionService.putAsignarSolicitudUsuario(data).subscribe(
      () => {
        this.visibleMantener = false;
        this.visibleAsignacion = false;
        this.isLoadingAsignacionUsuario = false;
        this.visibleAsignacionDepartamento = false;
        this.visibleAsignacionCurricular = false;

        this.AsignarUsuarioForm.reset();
        this.UsuarioForm.reset();

        switch (this.tipoSolicitudActual) {
          case 'Estrategica':
            this.cargarSolicitudEstrategicas();
            break;
          case 'Administrativa':
            this.cargarSolicitudAdministrativa();
            break;
          case 'Curricular':
            this.cargarSolicitudCurricular();
            break;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Ticket asignado correctamente.',
          life: 3000
        });

        this.closableDialog = true;
        this.AsignarUsuarioForm.enable();
        this.UsuarioForm.enable();
      },
      error => {
        this.isLoadingAsignacionUsuario = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al asignar el ticket.',
          life: 3000
        });
        this.closableDialog = true;
        this.AsignarUsuarioForm.enable();
        this.UsuarioForm.enable();
      }
    );
  }


  asignarSolicitudCurricular(): void {
    this.isLoadingAsignacionUsuario = true;
    this.closableDialog = false;

    // Forzar que idTipoAsignacion siempre sea 4
    const tipoAsignacion = 4;
    this.AsignarUsuarioForm.get('idTipoAsignacion')?.setValue(tipoAsignacion);

    // Forzar que idEtapa siempre sea 1
    this.AsignarUsuarioForm.get('idEtapa')?.setValue(1);

    // 🔹 Capturar los valores antes de deshabilitar
    const formDataValue = this.AsignarUsuarioForm.value;
    const usuarioAsignacionValue = this.usuarioAsignacion.getRawValue(); // <-- Aquí usamos getRawValue()

    let UsuarioJSON = '';

    // Validación: usuarios obligatorios
    if (usuarioAsignacionValue && Array.isArray(usuarioAsignacionValue) && usuarioAsignacionValue.length > 0) {
      UsuarioJSON = JSON.stringify(usuarioAsignacionValue);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Operación Fallida',
        detail: 'Los usuarios son requeridos.',
        life: 3000
      });
      this.isLoadingAsignacionUsuario = false;
      this.closableDialog = true;
      this.AsignarUsuarioForm.enable();
      this.UsuarioForm.enable();
      return;
    }

    // 🔹 Deshabilitar formularios después de capturar los valores
    this.AsignarUsuarioForm.disable();
    this.UsuarioForm.disable();

    const data = {
      ...formDataValue,
      datosAsignacion: UsuarioJSON,
    };

  //console.log('Datos a enviar al backend:', data); // Depuración

    this.AsignacionService.putAsignarSolicitudUsuario(data).subscribe(
      () => {
        this.visibleMantener = false;
        this.visibleAsignacion = false;
        this.isLoadingAsignacionUsuario = false;
        this.visibleAsignacionDepartamento = false;
        this.visibleAsignacionCurricular = false;

        this.AsignarUsuarioForm.reset();
        this.UsuarioForm.reset();

        switch (this.tipoSolicitudActual) {
          case 'Estrategica':
            this.cargarSolicitudEstrategicas();
            break;
          case 'Administrativa':
            this.cargarSolicitudAdministrativa();
            break;
          case 'Curricular':
            this.cargarSolicitudCurricular();
            break;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Ticket asignado correctamente.',
          life: 3000
        });

        this.closableDialog = true;
        this.AsignarUsuarioForm.enable();
        this.UsuarioForm.enable();
      },
      error => {
        this.isLoadingAsignacionUsuario = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al asignar el ticket.',
          life: 3000
        });
        this.closableDialog = true;
        this.AsignarUsuarioForm.enable();
        this.UsuarioForm.enable();
      }
    );
  }
  // ----
  aprobarRevision() {
    this.closableDialog = false;
    this.RevisionAsignacionForm.disable();
    const revision = this.RevisionAsignacionForm.value;
    const estadoActual = Number(revision.idEstadoSolicitud);
    const tipoSolicitud = Number(revision.idTipoSolicitud);

    let mensajeDetalle = 'Ticket Procesado';
    let mensajeError = 'Error al procesar el Ticket';

    if (estadoActual === 20) {
      revision.idEstadoSolicitud = '7';
      mensajeDetalle = 'Ticket Aprobado';
      mensajeError = 'Error al aprobar el Ticket';
    } else if (estadoActual === 7) {
      revision.idEstadoSolicitud = '31';
      mensajeDetalle = 'Ticket Dictaminado';
      mensajeError = 'Error al dictaminar el Ticket';
    }

    const etapasBase = tipoSolicitud === 10 ? [1, 2] : [1, 2, 3];
    const etapasNuevas = etapasBase.map(etapa => etapa + 3);

    const formData = new FormData();

    // Agregar archivos
    this.selectedFiles.forEach(file => {
      formData.append('image', file, file.name);
    });

    // Agregar campos del formulario
    for (const key in revision) {
      if (revision.hasOwnProperty(key) && revision[key] !== null && revision[key] !== undefined) {
        formData.append(key, revision[key]);
      }
    }

    // Agregar etapas como JSON string
    formData.append('etapas', JSON.stringify(etapasNuevas));

    this.isLoadingAceptarRevision = true;

    this.AsignacionService.putRevisarAsignacion(formData)
      .subscribe({
        next: (res: any) => {
          this.visibleRevisionAsignacion = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: mensajeDetalle,
          });

          this.RevisionAsignacionForm.reset();
          this.isLoadingAceptarRevision = false;
          this.selectedFiles = [];
          this.closableDialog = true;
          this.RevisionAsignacionForm.enable();



          switch (this.tipoSolicitudActual) {
            case 'Estrategica': this.cargarSolicitudEstrategicas(); break;
            case 'Administrativa': this.cargarSolicitudAdministrativa(); break;
            case 'Curricular': this.cargarSolicitudCurricular(); break;
          }
        },
        error: (error) => {
          const msg = error?.error?.mensaje || mensajeError;
          this.visibleRevisionAsignacion = true;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: msg,
          });
          this.isLoadingAceptarRevision = false;
          this.closableDialog = true;
          this.RevisionAsignacionForm.enable();

        }
      });
  }

  denegarRevision() {
    this.closableDialog = false;
    this.RevisionAsignacionForm.get('observacion')?.disable();

    const revision = this.RevisionAsignacionForm.value;

    const estadoActual = Number(revision.idEstadoSolicitud);

    if (estadoActual === 20) {
      revision.idEstadoSolicitud = '8';
    } else if (estadoActual === 7) {
      revision.idEstadoSolicitud = '8';
    }

    this.isLoadingRechazarRevision = true;
    this.AsignacionService.putRevisarAsignacion(revision).subscribe(
      (response) => {
        this.visibleRevisionAsignacion = false;


        // Mensaje de éxito y lógica de carga
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket revisado y devuelto al asignado debido a observaciones.', });
        this.RevisionAsignacionForm.reset();
        this.isLoadingRechazarRevision = false;

        if (this.tipoSolicitudActual === 'Estrategica') {
          this.cargarSolicitudEstrategicas();
        } else if (this.tipoSolicitudActual === 'Administrativa') {
          this.cargarSolicitudAdministrativa();
        } else if (this.tipoSolicitudActual === 'Curricular') {
          this.cargarSolicitudCurricular();
        }
        this.closableDialog = true;
        this.RevisionAsignacionForm.get('observacion')?.enable();

      },
      (error) => {
        this.visibleRevisionAsignacion = true;
        this.closableDialog = true;
        this.RevisionAsignacionForm.get('observacion')?.enable();

        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al retonar el Ticket al asignado.', });
        this.isLoadingRechazarRevision = false; // ← Aquí también corriges el nombre de la variable
      }
    );
  }

  fechaAsignacion() {

    this.closableDialog = false;
    this.FechaForm.disable();

    const fecha = this.FechaForm.value;
    const idSoli = fecha.idSolicitud;

    this.loadingFecha = true;
    this.loadingAsignados = true;

    if (!idSoli) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'No se encontró el ID de la solicitud.',
      });
      this.loadingFecha = false;
      this.loadingAsignados = false;
      this.closableDialog = true;
      this.FechaForm.enable();
      return;
    }

    // Validar que la fecha no esté vacía
    if (!fecha.nuevaFechaFinalizacion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Hay fila incompleta. Debe seleccionar una fecha antes de enviar.',
        life: 3000
      });

      // Marcar el campo como tocado para que muestre error si usas estilos
      this.FechaForm.get('nuevaFechaFinalizacion')?.markAsTouched();
      this.loadingFecha = false;
      this.loadingAsignados = false;
      this.closableDialog = true;
      this.FechaForm.enable();
      return;
    }

    // Continuar si pasa validaciones
    this.AsignacionService.putFechaAsignacion(fecha).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Fecha de Asignación actualizada correctamente.'
        });
        this.closableDialog = true;
        this.FechaForm.enable();

        this.AsignacionService.getUsuariosAsignadosTicket(idSoli).subscribe(
          (response: any) => {
            this.asignado = response.map((asignado: any, index: number) => ({
              numero: index + 1,
              ...asignado,
            }));

          //console.log('Tipo de solicitud actual:', this.tipoSolicitudActual);
            if (this.tipoSolicitudActual === 'Estrategica') {
              this.cargarSolicitudEstrategicas();
            } else if (this.tipoSolicitudActual === 'Administrativa') {
              this.cargarSolicitudAdministrativa(); // Asegúrate de tener este método implementado
            } else if (this.tipoSolicitudActual === 'Curricular') {
              this.cargarSolicitudCurricular(); // Asegúrate de tener este método implementado
            }

            this.mostrarFormularioFecha = false;
            this.loadingFecha = false;
            this.loadingAsignados = false;
            this.FechaForm.get('nuevaFechaFinalizacion')?.reset();
            this.closableDialog = true;
            this.FechaForm.enable();
          },
          (error) => {
            //console.error('Error recargando asignados:', error);
            this.showErrorMessage(error.error.mensaje);
            this.mostrarFormularioFecha = false;
            this.loadingFecha = false;
            this.loadingAsignados = false;
            this.closableDialog = true;
            this.FechaForm.enable();
          }
        );
      },
      (error) => {
        //console.error('Error actualizando fecha:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar la Fecha de Asignación.'
        });
        this.loadingFecha = false;
        this.loadingAsignados = false;
        this.closableDialog = true;
        this.FechaForm.enable();
      }
    );
  }

  reasignacionAsignacion(): void {
    this.closableDialog = false;

    // 🔹 Deshabilitar formularios después de capturar valores
    const formDataValue = this.MiembrosAsignadosForm.value;
    const miembroAsignadosValue = this.miembroAsignados.getRawValue(); // <-- Captura valores reales incluso si están deshabilitados
    const idSoli = formDataValue.idSolicitud;

    if (!miembroAsignadosValue || !Array.isArray(miembroAsignadosValue) || miembroAsignadosValue.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Operación Fallida',
        detail: 'Debe agregar al menos un responsable.',
        life: 3000,
      });
      this.isLoadingAsignados = false;
      this.loadingAsignados = false;
      this.closableDialog = true;
      return;
    }

    // 🚨 Validación: verificar que todos los idUsuario estén seleccionados
    const tieneCamposVacios = this.miembroAsignados.controls.some(ctrl => !ctrl.get('idUsuario')?.value);
    if (tieneCamposVacios) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Hay filas incompletas. Debe seleccionar un usuario antes de enviar.',
        life: 3000
      });

      this.miembroAsignados.controls.forEach(ctrl => {
        ctrl.get('idUsuario')?.markAsTouched();
        ctrl.get('idUsuario')?.updateValueAndValidity();
      });

      this.isLoadingAsignados = false;
      this.loadingAsignados = false;
      this.closableDialog = true;
      return;
    }

    // 🔹 Deshabilitar formularios después de validar
    this.MiembrosAsignadosForm.disable();
    this.MiembrosForm.disable();
    this.isLoadingAsignados = true;
    this.loadingAsignados = true;

    const data = {
      ...formDataValue,
      usuariosJson: JSON.stringify(miembroAsignadosValue),
    };

  //console.log('Datos que se enviarán al backend:', data); // Depuración

    this.AsignacionService.putMiembrosAsignacion(data).subscribe(
      () => {
        if (idSoli) {
          this.AsignacionService.getUsuariosAsignadosTicket(idSoli).subscribe(
            (response: any) => {
              this.asignado = response.map((asignado: any, index: number) => ({
                numero: index + 1,
                ...asignado,
              }));

              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Responsables actualizados correctamente.',
                life: 3000,
              });

              this.mostrarFormularioMiembros = false;
              this.MiembrosAsignadosForm.get('usuariosJson')?.reset();
              this.isLoadingAsignados = false;
              this.loadingAsignados = false;

              this.closableDialog = true;
              this.MiembrosAsignadosForm.enable();
              this.MiembrosForm.enable();

              if (this.tipoSolicitudActual === 'Estrategica') {
                this.cargarSolicitudEstrategicas();
              } else if (this.tipoSolicitudActual === 'Administrativa') {
                this.cargarSolicitudAdministrativa();
              } else if (this.tipoSolicitudActual === 'Curricular') {
                this.cargarSolicitudCurricular();
              }
            },
            (error) => {
              this.showErrorMessage(error.error.mensaje);
              this.isLoadingAsignados = false;
              this.loadingAsignados = false;
              this.closableDialog = true;
              this.MiembrosAsignadosForm.enable();
              this.MiembrosForm.enable();
            }
          );
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Responsables actualizados, pero no se recargó la tabla por falta de identificador.',
            life: 3000,
          });
          this.mostrarFormularioMiembros = false;
          this.MiembrosAsignadosForm.reset();
          this.isLoadingAsignados = false;
          this.loadingAsignados = false;
          this.closableDialog = true;
          this.MiembrosAsignadosForm.enable();
          this.MiembrosForm.enable();
        }
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al actualizar los responsables.',
          life: 3000,
        });
        this.isLoadingAsignados = false;
        this.loadingAsignados = false;
        this.closableDialog = true;
        this.MiembrosAsignadosForm.enable();
        this.MiembrosForm.enable();
      }
    );
  }






}
