// Angular Core
import { Component, OnInit, ViewChild } from '@angular/core';

// Angular Forms
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../primeng.imports';
import { AngularImports } from '../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../servicios/seguridad/acceso/permiso/permiso.service';
import { UsuarioService } from '../../../servicios/seguridad/usuario/usuario.service';

// Servicios - Solicitud
import { AsignacionService } from '../../../servicios/solicitud/asignacion/asignacion.service';
import { HistorialService } from '../../../servicios/solicitud/historial/historial.service';

// Servicios - Otros
import { ArchivoService } from '../../../servicios/archivo/archivo.service';
import { ComisionService } from '../../../servicios/comision/comision.service';
import { ReporteService } from '../../../servicios/reporte/reporte.service';

// Componentes
import { HistorialModalComponent } from '../../solicitud/historial/historial-modal/historial-modal.component';
import { ParametroService } from '../../../servicios/seguridad/parametro/parametro.service';
import { HistorialArchivoComponent } from '../../solicitud/historial/historial-archivo/historial-archivo.component';


interface Asignacion {
  idAsignacion: number;
  idSolicitud: number;
  ticket: string;
  idTipoSolicitud: number;
  tipoSolicitud: string;
  nombreSolicitud: string | null;
  nombrePersona: string;
  asunto: string | null;
  observacion: string | null;
  dfFechaAsignacion: string;
  fechaFinalizacion: string | null;
  fechaRealFinalizacion: string | null;
  estadoSolicitud: string;
  idEstadoSolicitud: number;

  rolesAsignados: string | string[] | number[];

  estadosSolicitud?: {
    idEtapa: number;
    idEtapaPorSolicitud: number;
    idEstadoSolicitud: number;
    [key: string]: any;
  }[];

  idEtapa?: number;
  idEtapaPorSolicitud?: number;

  // Agrega esta línea:
  archivos?: any[];

  archivosRecientes?: any[];
  archivosPlantilla?: any[];
}

interface EvaluacionResult {
  idEstado: number
  idEtapa: number | null
  idEtapaPorSolicitudAEnviar: number | null
  omitirNotificacionDB: boolean
  mensaje?: string
}

@Component({
  selector: 'app-mis-asignaciones',
  imports: [PrimeNGImports, AngularImports, HistorialModalComponent, HistorialArchivoComponent],
  providers: [MessageService],
  templateUrl: './mis-asignaciones.component.html',
  styleUrl: './mis-asignaciones.component.scss'
})

export class MisAsignacionesComponent implements OnInit {

  @ViewChild('fileUploader') fileUploader!: any; // asegúrate que coincida con el # del HTML
  @ViewChild('filePopover') filePopover: any;
  @ViewChild('dtAdministrativa') dtAdministrativa: any;
  @ViewChild('dtCurricular') dtCurricular: any;
  @ViewChild('dtEstrategica') dtEstrategica: any;
  @ViewChild('historialHijo') historialHijo!: HistorialArchivoComponent;
  
  private rolesExternosDD = [23, 24, 25, 26];

  nombreSubComision: string = '';
  tipoSolicitudActual: string = '';
  tipoSolicitud: string = '';
  nombreSolicitud: string = '';
  nombreSolicitudes: string = '';
  ticket: string = '';
  observacion = "";
  idAsignacion: number | null = null;
  nombreTicketSeleccionado: string = '';
  searchValue: string | undefined;
  permitidos = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.,\-@:;()"%#]*$/;
  palabrasProhibidas = /(select|insert|delete|update|drop|alter|create|exec|truncate)/gi;

  fechaRealFinalizacion: Date | null = null;

  historialEstados: any[] = [];
  solicitudEstrategica: any[] = [];
  solicitudCurricular: any[] = [];
  solicitudAdministrativa: any[] = [];
  integrantes: any[] = [];
  archivos: any[] = [];
  MisAsignaciones: any[] = [];
  logEventos: any[] = [];
  estadosSeleccionados: any[] = [];
  plantillas: any[] = [];
  asignacionSeleccionada: any = null;

  AsignarForm: FormGroup;

  esEspecialActual: boolean = false;  // declara esta variable en la clase
  archivoSubido: boolean = false;
  estadoAlertaEstrategica: boolean = false;
  estadoAlertaCurricular: boolean = false;
  estadoAlertaAdministrativa: boolean = false;
  mostrarColumnaSalida: boolean = false;
  mostrarAlgo: boolean = false;
  mostrarTabs: boolean = true;

  loadingBtnKey: string | null = null;
  idEtapaPorSolicitud: number | null = null;
  loadingEvaluacionMap: Record<number, boolean> = {};

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;
  loadingHistorial: boolean = false;


  isLoading = false;
  isLoadingObservacion: boolean = false;
  loadingSolicitudEstrategica: boolean = false;
  loadingSolicitudCurricular: boolean = false;
  loadingSolicitudAdministrativa: boolean = false;
  loadingRevision: boolean = false;
  loadingEvaluacion: boolean = false;
  loadingObservacion: boolean = false;
  loadingtable: boolean = false;
  loadingDialogGeneral: boolean = false;
  loadingDialogIntegrante: boolean = false;
  loadingAsignar: boolean = false;
  isLoadingAsignar: boolean = false;
  isLoadingArchivos: boolean = false;
  isLoadingDictaminar = false;

  // Variable para manejar la visibilidad del modal
  visibleDictaminar: boolean = false;
  visibleAsignar: boolean = false;
  visibleHabilitar: boolean = false;
  visibleIntegrante: boolean = false;
  visibleHistorial = false;
  visibleObservacion: boolean = false;
  modalVisible: boolean = false;
  esAsignadorActual: boolean = false;
  showError: boolean = false;

  loadingSolicitudId: number | null = null; // ID del botón que está cargando
  idEstadoSolicitud!: number;
  activeTab: number = 0;
  length = 0;
  decisionActual: 'aprobar' | 'correccion' | null = null;

  //Variables para funcionalidad de archivos
  selectedFiles: File[] = [];
  nombresArchivos: string[] = [];
  fileUploaded: boolean = false;
  rutas: { nombreOriginal: string; key: string }[] = [];
  Bucket: string = '';
  Location: string = '';
  loading: boolean = false;
  uploadedFiles: any[] = [];


  plantillasPorTipoSolicitud: { [key: number]: { [etapa: number]: number[] } } = {
    5: { 1: [3], 2: [4], 3: [6] },
    6: { 1: [3], 2: [5], 3: [6] },
    10: { 1: [3], 3: [6] }
  };


  limiteCaracteres = 500;
  EvaluarForm!: FormGroup;
  HabilitarForm!: FormGroup;
  ObservacionForm!: FormGroup;


  ticketSeleccionado: string = '';
  historialVisible = false;
  idSolicitudSeleccionada!: number;


  constructor(
    private messageService: MessageService,
    private fb: FormBuilder,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private AsignacionService: AsignacionService,
    private ComisionService: ComisionService,
    private ArchivoService: ArchivoService,
    public srvHistorial: HistorialService,
    public usuarioService: UsuarioService,
    private srvReporte: ReporteService,
    private srvParametro: ParametroService

  ) {
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


    this.EvaluarForm = this.fb.group({
      idAsignacion: [null, Validators.required],
      idSolicitud: [null, Validators.required],
      observacion: [
        '',
        [
          Validators.minLength(10),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.,\-@:;()"%#]+$/),
          this.sqlInjectionValidator
        ]
      ],
      estado: [''],
      fechaRealFinalizacion: [new Date().toISOString()],
      idEstadoSolicitud: [null],
      decisionBool: [null]
    });




    this.HabilitarForm = this.fb.group({
      observacion: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.,\-@:;()"%#]+$/),
          this.sqlInjectionValidator
        ]
      ],
      idEstadoSolicitud: [null],
      idEtapa: [null]
    });

    this.ObservacionForm = this.fb.group({
      observacion: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\.,\-@:;()"%#]+$/),
          this.sqlInjectionValidator
        ]
      ],
      idEstadoSolicitud: [27]
    });
  }


  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.loadingtable = false;
    this.obtenerPermisos();
  }


  columnasBase = [
    { campo: 'ticket', nombre: 'Ticket' },
    { campo: 'nombreSolicitud', nombre: 'Nombre de la Solicitud' },
    { campo: 'dfFechaAsignacion', nombre: 'Fecha de Asignación' },
    { campo: 'fechaFinalizacion', nombre: 'Fecha de Finalizacion' },
  ];

  exportarPDFAdministrativa() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dtAdministrativa,
      this.columnasBase,
      'asignaciones-solicitudes-administrativas-'+this.srvReporte.getFecha(),
      'Reporte de Asignaciones Administrativas'
    );
  }

  exportarPDFCurricular() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dtCurricular,
      this.columnasBase,
      'asignaciones-solicitudes-curriculares-'+this.srvReporte.getFecha(),
      'Reporte de Asignaciones Curriculares'
    );
  }

  exportarPDFEstrategica() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dtEstrategica,
      this.columnasBase,
      'asignaciones-estrategicas-'+this.srvReporte.getFecha(),
      'Reporte de Asignaciones Estratégicas'
    );
  }
  exportarExcelAdministrativa() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dtAdministrativa,
      this.columnasBase,
      'asignaciones-solicitudes-administrativas-'+this.srvReporte.getFecha(),
    );
  }

  exportarExcelCurricular() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dtCurricular,
      this.columnasBase,
      'asignaciones-solicitudes-curriculares-'+this.srvReporte.getFecha(),
    );
  }

  exportarExcelEstrategica() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dtEstrategica,
      this.columnasBase,
      'asignaciones-solicitudes-estrategicas-'+this.srvReporte.getFecha(),
    );
  }
  //Funcion para mostrar el historial
  mostrarHistorials(idSolicitud: number, ticket: string) {
    this.loadingHistorial = true;
    this.srvHistorial.getHistorial(idSolicitud).subscribe(data => {
      this.historialEstados = data;
      this.nombreTicketSeleccionado = ticket;
      this.mostrarAlgo = true; // ⚠️ Esto es lo que abre el modal
      this.loadingHistorial = false;
    });
  }
  mostrarHistorial(idSolicitud: number, ticket: string, idEtapa?: number): void {
    this.loadingHistorial = true;

    this.srvHistorial.getHistorial(idSolicitud, idEtapa).subscribe((data) => {
      this.historialEstados = data;
      this.mostrarAlgo = true;
      this.loadingHistorial = false;
      this.nombreTicketSeleccionado = ticket; // asignas el nombre
    });
  }

  mostrarBotonHistorial(solicitud: any): boolean {
    // Lógica opcional, si en el futuro quieres condicionar también el historial
    return true; // o alguna condición si aplica
  }


  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 6; // El objeto que estás consultando

    if(roles.some(rol => this.rolesExternosDD.includes(rol))){
      this.activeTab = 1;
      this.mostrarTabs = false;
      this.cargarMisAsignaciones(2);
    } else {
      this.activeTab = 0;
      this.mostrarTabs = true;
      this.cargarMisAsignaciones(1);
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
  showDialog(dialogType: 'Asignar' | 'Integrante') {
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

  toggleExpand(event: any): void {
    event.expanded = !event.expanded;
  }

  getColoresPorEstado(idEstado: number): { backgroundColor: string, textColor: string } {
    const colores: { [key: number]: { backgroundColor: string, textColor: string } } = {
      1: { backgroundColor: '#e0e6ed', textColor: '#495057' },
      2: { backgroundColor: '#d1ecf1', textColor: '#0c5460' },
      3: { backgroundColor: '#d4edda', textColor: '#155724' },
      4: { backgroundColor: '#f8d7da', textColor: '#721c24' },
      5: { backgroundColor: '#cce5ff', textColor: '#004085' },
      6: { backgroundColor: '#b8daff', textColor: '#003865' },
      7: { backgroundColor: '#ffe8cc', textColor: '#856404' },
      8: { backgroundColor: '#fff3cd', textColor: '#856404' },
      9: { backgroundColor: '#d1f2eb', textColor: '#0f5132' },
      10: { backgroundColor: '#ffe8cc', textColor: '#855404' },
      11: { backgroundColor: '#fff3cd', textColor: '#856404' },
      12: { backgroundColor: '#d1f2eb', textColor: '#0f5132' },
      13: { backgroundColor: '#ffe8cc', textColor: '#855404' },
      14: { backgroundColor: '#fff3cd', textColor: '#856404' },
      15: { backgroundColor: '#d1f2eb', textColor: '#0f5132' },
      16: { backgroundColor: '#ffe8cc', textColor: '#855404' },
      17: { backgroundColor: '#fff3cd', textColor: '#856404' },
      18: { backgroundColor: '#e2e3f3', textColor: '#383d56' },
      19: { backgroundColor: '#cce5ff', textColor: '#004085' },
      20: { backgroundColor: '#ffe8cc', textColor: '#856404' },
    };

    return colores[idEstado] || { backgroundColor: '#ffffff', textColor: '#000000' };
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

  getEstado(idEstado: number): string {
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

    return map[idEstado] || 'Enlace No Disponible';
  }

  obtenerClaseHistorial(solicitud: any): string {
    const evaluacionActiva = solicitud.idEstadoSolicitud === 5 || solicitud.idEstadoSolicitud === 6 ||
      solicitud.idEstadoSolicitud === 9 || solicitud.idEstadoSolicitud === 12 || solicitud.idEstadoSolicitud === 15;
    const observacionActiva = evaluacionActiva; // mismo criterio según tu código

    return (evaluacionActiva && observacionActiva) ? 'custom-1' : 'custom-7';
  }

  verificarLimiteCaracteres() {
    const control = this.ObservacionForm.get('observacion');
    if (control && control.value && control.value.length > this.limiteCaracteres) {
      control.setValue(control.value.slice(0, this.limiteCaracteres));
    }
  }

  getIconPlantilla(archivo: any): string {
    return this.loadingBtnKey === archivo.keys ? 'pi pi-spin pi-spinner' : 'bi bi-file-earmark-post';
  }

  getIconMaterial(archivo: any): string {
    return this.loadingBtnKey === archivo.keys ? 'pi pi-spin pi-spinner' : 'bi bi-file-earmark-code';
  }




  // ────────────────────────────────
  // Sección de Gestión de Archivos
  // Métodos para cargar, descargar, seleccionar, enviar y eliminar archivos
  // Incluye manejo de estado y control de interfaz (popover, nombres, rutas)
  // ───────────────────────────────────────────────────────────

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

  getfiles(event: any): void {
    const files = Array.from(event.files) as File[];

    console.log({files: files});
    if (files.length === 0) {
      this.archivoSubido = false;
      return;
    }

    this.selectedFiles = files;
    this.nombresArchivos = files.map(file => file.name);
    this.archivoSubido = true;
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

    this.selectedFiles = this.selectedFiles.filter(file => file.name !== fileToRemove);
    this.nombresArchivos = this.nombresArchivos.filter(name => name !== fileToRemove);
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
    const tipo = this.asignacionSeleccionada?.idTipoSolicitud;
    const parametros = this.plantillasPorTipoSolicitud[tipo]?.[idEtapa] || [];
    return this.plantillas.filter(p => parametros.includes(p.idParametro));
  }

  getMaterialEnviadoPorEtapa(idEtapa: number): any[] {
    return this.asignacionSeleccionada?.archivosPlantilla
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
    const index = Number(event); // Forzamos a number en caso de que venga como string
    this.tipoSolicitud = ['Estrategica', 'Curricular', 'Administrativa'][index];

    // Desactiva todos los loaders
    this.loadingtable = false;
    this.loadingSolicitudEstrategica = false;
    this.loadingSolicitudCurricular = false;
    this.loadingSolicitudAdministrativa = false;

    // Activa el loader y carga según el índice
    switch (index) {
      case 0:
        this.loadingSolicitudEstrategica = true;
        this.cargarMisAsignaciones(1);
        break;
      case 1:
        this.loadingSolicitudCurricular = true;
        this.cargarMisAsignaciones(2);
        break;
      case 2:
        this.loadingSolicitudAdministrativa = true;
        this.cargarMisAsignaciones(3);
        break;
    }
  }

  get obs() {
    return this.ObservacionForm.get('observacion');
  }

  cargarSelects(): void {
    //Cargar estados de usuario
    this.srvParametro.getPlantilla().subscribe(
      (response: any) => {
        this.plantillas = response;
      //console.log({plantillas: this.plantillas});
      },
      (error) => {
        ////console.error('Error al obtener la información', error);
      }
    );
  }


  cargarMisAsignaciones(idCategoria: number): void {
    // Activa el loading correspondiente a la categoría
    this.setLoadingCategoria(idCategoria, true);

    // Asignar el tipo de solicitud actual
    switch (idCategoria) {
      case 1: this.tipoSolicitudActual = 'Estrategica'; break;
      case 2: this.tipoSolicitudActual = 'Curricular'; break;
      case 3: this.tipoSolicitudActual = 'Administrativa'; break;
    }

    this.AsignacionService.getAsignacion(idCategoria).subscribe(
      (data: Asignacion[]) => {
        this.setLoadingCategoria(idCategoria, false);

        if (data.length > 0 && !('Mensaje' in data[0])) {
          this.MisAsignaciones = data.map((asignacion, index) => {
            const archivosEntrada = asignacion.archivosRecientes?.filter((a: any) => a.idTipoArchivo === 1) || [];
            const archivosSalida = asignacion.archivosRecientes?.filter((a: any) => a.idTipoArchivo === 2) || [];
            const archivosPlantilla = asignacion.archivosPlantilla || [];

            return {
              ...asignacion,
              numero: index + 1,
              archivosEntrada,
              archivosSalida,
              archivosPlantilla
            };
          });

          // Mostrar columna de salida si hay al menos un archivo de salida
          this.mostrarColumnaSalida = this.MisAsignaciones.some(asignacion =>
            asignacion.archivosSalida && asignacion.archivosSalida.length > 0
          );

          // Estados críticos según categoría
          const tieneEstadosCriticos = data.some((s: Asignacion) =>
            s.idEstadoSolicitud === 5 || s.idEstadoSolicitud === 6
          );

          switch (idCategoria) {
            case 1: this.estadoAlertaEstrategica = tieneEstadosCriticos; break;
            case 2: this.estadoAlertaCurricular = tieneEstadosCriticos; break;
            case 3: this.estadoAlertaAdministrativa = tieneEstadosCriticos; break;
          }

          this.cargarSelects();
        } else {
          this.MisAsignaciones = [];
          switch (idCategoria) {
            case 1: this.estadoAlertaEstrategica = false; break;
            case 2: this.estadoAlertaCurricular = false; break;
            case 3: this.estadoAlertaAdministrativa = false; break;
          }
        }

        this.length = this.MisAsignaciones.length;
      },
      (error) => {
        this.setLoadingCategoria(idCategoria, false);
      //console.error('Error al obtener asignaciones:', error);
      }
    );
  }


  setLoadingCategoria(idCategoria: number, estado: boolean): void {
    switch (idCategoria) {
      case 1:
        this.loadingSolicitudEstrategica = estado;
        break;
      case 2:
        this.loadingSolicitudCurricular = estado;
        break;
      case 3:
        this.loadingSolicitudAdministrativa = estado;
        break;
    }

  }

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
          this.showErrorMessage(error);
        }
      );

    }
  }

  abrirDialogoObservacion(asignacion: any, tipo: string): void {
    this.visibleObservacion = true;
    this.asignacionSeleccionada = asignacion;
    this.tipoSolicitudActual = tipo;

    // Asignar idEtapaPorSolicitud del primer estado si existe
    if (asignacion.estadosSolicitud && asignacion.estadosSolicitud.length > 0) {
      this.idEtapaPorSolicitud = asignacion.estadosSolicitud[0].idEtapaPorSolicitud;
    } else {
      this.idEtapaPorSolicitud = null;
    }

    this.ticket = asignacion.ticket;
    this.ObservacionForm.reset();
  }

  cerrarEvaluacion(): void {
    this.limpiarModales();
  }

  cerrarModal(): void {
    this.limpiarModales();
  }


  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // Dictimar, Historial
  // ────────────────────────────────

  // Función para saber si es tipo especial
  esEspecial(): boolean {
    if (!this.asignacionSeleccionada) return false;
    const tiposEspeciales = [5, 6, 10];
  //console.log('esEspecial', this.asignacionSeleccionada.idTipoSolicitud, tiposEspeciales.includes(this.asignacionSeleccionada.idTipoSolicitud));
    return tiposEspeciales.includes(this.asignacionSeleccionada.idTipoSolicitud);
    // Retorna true si es un tipo especial, false en caso contrario

  }

  async abrirModal(asignacion: any, tipoSolicitud: string, idTipoSolicitud: number): Promise<void> {
  //console.log('abrirModal asignacion:', asignacion);

    const id = asignacion.idAsignacion;
    this.loadingEvaluacionMap[id] = true;

    try {
      const estados = await this.AsignacionService.getEtapasPorSolicitud(asignacion.idSolicitud).toPromise();

    //console.log('Estados obtenidos desde backend:', estados);
    //console.log('Asignación completa:', asignacion);

      // Buscar el estado actual, o usar el primero como fallback
      const estadoActual = estados.find((e: any) => e.idEtapa === asignacion.idEtapa)
        ?? estados[0]
        ?? null;

      this.asignacionSeleccionada = {
        ...asignacion,
        idTipoSolicitud,
        idSolicitud: asignacion.idSolicitud,
        idEtapa: estadoActual?.idEtapa ?? asignacion.idEtapa ?? null,
        idEtapaPorSolicitud: estadoActual?.idEtapaPorSolicitud ?? asignacion.idEtapaPorSolicitud ?? null,
        estadosSolicitud: estados,
        nombreSolicitud: this.asignacionSeleccionada?.nombreSolicitud ?? null,
      };

    //console.log('nombreSolicitud:', asignacion.nombreSolicitud);
      this.ticket = asignacion.ticket;
      this.nombreSolicitudes = asignacion.nombreSolicitud;
      this.tipoSolicitud = asignacion.tipoSolicitud;

      this.EvaluarForm.patchValue({
        idAsignacion: asignacion.idAsignacion ?? null,
        idSolicitud: asignacion.idSolicitud ?? null,
      });

      // Mostrar modal especial solo si la solicitud es interna y es tipo 5, 6 o 10
      const tiposEspeciales = [5, 6, 10];
      this.esEspecialActual = asignacion.interna === true && tiposEspeciales.includes(+idTipoSolicitud);

    console.log('esEspecial:', idTipoSolicitud, this.esEspecialActual);
    //console.log('Etapa:', this.asignacionSeleccionada.idEtapa);
    //console.log('EtapaPorSolicitud:', this.asignacionSeleccionada.idEtapaPorSolicitud);
    //console.log('Estados disponibles:', estados);

      this.visibleDictaminar = true;
    } catch (error) {
    //console.error('Error al obtener etapas de la solicitud:', error);
    } finally {
      this.loadingEvaluacionMap[id] = false;
    }
  }

  abrirModalEtapa(idEtapaPorSolicitud: number, asignacion: any) {
    this.idEtapaPorSolicitud = idEtapaPorSolicitud;
    this.ticket = asignacion.ticket;
    this.asignacionSeleccionada = asignacion;
    this.visibleHabilitar = true; // esto abre el <p-dialog>
  }

  abrirModalEtapaDesdeBoton(asignacion: any): void {
    const etapaActual = asignacion.idEtapa;

    const estado = asignacion.estadosSolicitud?.find((e: any) => e.idEtapa === etapaActual);
    const idEtapaPorSolicitud = estado?.idEtapaPorSolicitud ?? null;

    this.abrirModalEtapa(idEtapaPorSolicitud, asignacion);
  }

  setDecisionAndSubmit(decision: boolean): void {
    this.EvaluarForm.patchValue({ decisionBool: decision });
    this.evaluarAsignacion(); // Aquí sí puedes llamarlo sin parámetro
  }


  public evaluarAsignacion(): void {
    const asignacion = this.asignacionSeleccionada!;
    const idTipo = asignacion.idTipoSolicitud;
    const decision = this.EvaluarForm.value.decisionBool ? 'Aprobada' : 'Corregida';

  //console.log("INICIO evaluarAsignacion");

    let evaluacion: EvaluacionResult;


    if (asignacion.interna === false) {
      evaluacion = this.evaluarTiposConArchivo(asignacion);
    } else if ([5, 6].includes(idTipo)) {
      evaluacion = this.evaluarTipo5y6(asignacion, decision);
    } else if (idTipo === 10) {
      evaluacion = this.evaluarTipo10(asignacion, decision);
    } else if ([1, 2, 3, 4, 7, 8, 9, 11, 12].includes(idTipo)) {
      evaluacion = this.evaluarTiposConArchivo(asignacion);
    } else {
      evaluacion = {
        idEstado: 20,
        idEtapa: null,
        idEtapaPorSolicitudAEnviar: null,
        omitirNotificacionDB: false,
        mensaje: `Tipo de solicitud ${idTipo} no tiene lógica definida`
      };
    }

    console.log({evaluacion: evaluacion});
    this.enviarEvaluacion(evaluacion);
  }

  private evaluarTiposConArchivo(asignacion: Asignacion): EvaluacionResult {
    const roles = this.obtenerRoles(asignacion);
    const estado = roles.some(r => [3, 4, 24, 25].includes(r)) ? 29 : 20;
    return {
      idEstado: estado,
      idEtapa: asignacion.idEtapa ?? null,
      idEtapaPorSolicitudAEnviar: asignacion.idEtapaPorSolicitud ?? null,
      omitirNotificacionDB: false
    };
  }

  private evaluarTipo5y6(asignacion: Asignacion, decisionTexto: string): EvaluacionResult {
    const obs = this.EvaluarForm.get('observacion')?.value?.trim();
    if (decisionTexto === 'Aprobada' && obs?.length > 0) {
      decisionTexto = 'Corregida';
    }

    const estados = this.obtenerEstadosSolicitud(asignacion);
    const { idEstadoSolicitud, idEtapa } = asignacion;
    const existeEtapa2 = estados.some(e => e.idEtapa === 2);
    const existeEtapa3 = estados.some(e => e.idEtapa === 3);
    const etapaActual = estados.find(e => e.idEtapa === idEtapa);

    switch (idEstadoSolicitud) {
      case 21:
        return {
          idEstado: 9,
          idEtapa: 1,
          idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
          omitirNotificacionDB: false
        };
      case 22:
        return {
          idEstado: 12,
          idEtapa: 2,
          idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
          omitirNotificacionDB: false
        };
      case 10:
        if (decisionTexto === 'Aprobada') {
          return existeEtapa2
            ? {
              idEstado: 26,
              idEtapa: 1,
              idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
              omitirNotificacionDB: true
            }
            : {
              idEstado: 12,
              idEtapa: 2,
              idEtapaPorSolicitudAEnviar: null,
              omitirNotificacionDB: false
            };
        } else {
          return {
            idEstado: 11,
            idEtapa: 1,
            idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
            omitirNotificacionDB: true
          };
        }
      case 13:
        if (decisionTexto === 'Aprobada') {
          return existeEtapa3
            ? {
              idEstado: 26,
              idEtapa: 2,
              idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
              omitirNotificacionDB: true
            }
            : {
              idEstado: 15,
              idEtapa: 3,
              idEtapaPorSolicitudAEnviar: null,
              omitirNotificacionDB: false
            };
        } else {
          return {
            idEstado: 14,
            idEtapa: 2,
            idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
            omitirNotificacionDB: true
          };
        }
      case 16:
        return {
          idEstado: decisionTexto === 'Aprobada' ? 29 : 17,
          idEtapa: 3,
          idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
          omitirNotificacionDB: false
        };
      case 30:
        return {
          idEstado: decisionTexto === 'Aprobada' ? 29 : 29,
          idEtapa: 3,
          idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
          omitirNotificacionDB: false
        };
      case 23:
        return {
          idEstado: 15,
          idEtapa: 3,
          idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
          omitirNotificacionDB: false
        };
    }

    // Si no coincide con ninguno, devolver un estado por defecto o error
    return {
      idEstado: 20,
      idEtapa: null,
      idEtapaPorSolicitudAEnviar: null,
      omitirNotificacionDB: false
    };
  }

  private evaluarTipo10(asignacion: Asignacion, decisionTexto: string): EvaluacionResult {
    const obs = this.EvaluarForm.get('observacion')?.value?.trim();
    if (decisionTexto === 'Aprobada' && obs?.length > 0) {
      decisionTexto = 'Corregida';
    }

    const estados = this.obtenerEstadosSolicitud(asignacion);
    const { idEstadoSolicitud, idEtapa } = asignacion;
    const existeEtapa3 = estados.some(e => e.idEtapa === 3);
    const etapaActual = estados.find(e => e.idEtapa === idEtapa);

    switch (idEstadoSolicitud) {
      case 21:
        return {
          idEstado: 9,
          idEtapa: 1,
          idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
          omitirNotificacionDB: false
        };
      case 10:
        if (decisionTexto === 'Aprobada') {
          return existeEtapa3
            ? {
              idEstado: 26,
              idEtapa: 1,
              idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
              omitirNotificacionDB: true
            }
            : {
              idEstado: 15,
              idEtapa: 3,
              idEtapaPorSolicitudAEnviar: null,
              omitirNotificacionDB: false
            };
        } else {
          return {
            idEstado: 11,
            idEtapa: 1,
            idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
            omitirNotificacionDB: true
          };
        }
      case 16:
        return {
          idEstado: decisionTexto === 'Aprobada' ? 29 : 17,
          idEtapa: 3,
          idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
          omitirNotificacionDB: false
        };
      case 30:
        return {
          idEstado: decisionTexto === 'Aprobada' ? 29 : 29,
          idEtapa: 3,
          idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
          omitirNotificacionDB: false
        };
      case 23:
        return {
          idEstado: 15,
          idEtapa: 3,
          idEtapaPorSolicitudAEnviar: etapaActual?.idEtapaPorSolicitud,
          omitirNotificacionDB: false
        };
    }

    return {
      idEstado: 20,
      idEtapa: null,
      idEtapaPorSolicitudAEnviar: null,
      omitirNotificacionDB: false
    };
  }

  private enviarEvaluacion(data: EvaluacionResult): void {
    const formData = new FormData();

    formData.append("idAsignacion", this.asignacionSeleccionada.idAsignacion?.toString() || "");
    formData.append("idSolicitud", this.asignacionSeleccionada.idSolicitud?.toString() || "");
    formData.append("idEstadoSolicitud", data.idEstado?.toString() || "");
    formData.append("idEtapa", data.idEtapa?.toString() || "");
    formData.append("idEtapaPorSolicitud", data.idEtapaPorSolicitudAEnviar?.toString() || "");
    formData.append("observacion", this.EvaluarForm.value.observacion || "");
    formData.append("omitNotificacionDB", data.omitirNotificacionDB?.toString() || "false");
    formData.append("estadoActual", this.asignacionSeleccionada.idEstadoSolicitud?.toString() || "");
    formData.append("decisionBool", this.EvaluarForm.value.decisionBool?.toString() || "false");
    formData.append("rolesAsignados", this.asignacionSeleccionada.rolesAsignados || "");

    // Adjuntar archivos solo si no es especial y hay archivos seleccionados
    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach(file => {
        formData.append("image", file); // <-- Aquí el nombre 'image' debe coincidir con Multer
      });
    }

    //console.log({selectedFiles: this.selectedFiles});

    this.isLoadingDictaminar = true;

    //console.log({formData: formData});
    this.AsignacionService.postDictaminarAsignacion(formData).subscribe({
      next: () => this.onEvaluacionExitosa(),
      error: (error) => this.onEvaluacionError(error),
      complete: () => this.isLoadingDictaminar = false
    });
  }

  private onEvaluacionExitosa(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Evaluación enviada correctamente',
    });

    this.visibleDictaminar = false;
    this.EvaluarForm.reset();

    // Limpiar archivos seleccionados
    this.selectedFiles = [];
    this.nombresArchivos = [];
    this.fileUploaded = false;
    this.cerrarModal;
    this.cerrarEvaluacion();
    this.visibleHabilitar = false;
    this.visibleObservacion = false;
    this.visibleHistorial = false;
    this.visibleIntegrante = false;
    this.modalVisible = false;
    this.visibleDictaminar = false;
    this.EvaluarForm.reset();
    this.limpiarModales()
    const tipoId =
      this.tipoSolicitudActual === 'Estrategica' ? 1 :
        this.tipoSolicitudActual === 'Curricular' ? 2 :
          this.tipoSolicitudActual === 'Administrativa' ? 3 :
            0; // tipo desconocido

    this.cargarMisAsignaciones(tipoId);
  }

  private onEvaluacionError(error: any): void {
    this.isLoadingDictaminar = false;

    //console.error("Error al enviar la evaluación:", error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo enviar la evaluación. Intenta de nuevo.',
    });
  }

  private obtenerRoles(asignacion: any): number[] {
    if (Array.isArray(asignacion.rolesAsignados)) {
      return asignacion.rolesAsignados.map((r: any) =>
        typeof r === "string" ? Number.parseInt(r.trim()) : r
      );
    }

    if (typeof asignacion.rolesAsignados === "string") {
      return asignacion.rolesAsignados
        .split(",")
        .map((r: any) => Number.parseInt(r.trim()))
        .filter((r: any) => !isNaN(r));
    }

    //console.warn("rolesAsignados no es válido, usando array vacío");
    return [];
  }

  private obtenerEstadosSolicitud(asignacion: any): any[] {
    if (Array.isArray(asignacion.estadosSolicitud)) {
      return asignacion.estadosSolicitud;
    }

    if (asignacion.idEstadoSolicitud && asignacion.idEtapa && asignacion.idEtapaPorSolicitud) {
      return [{
        idEstadoSolicitud: asignacion.idEstadoSolicitud,
        idEtapa: asignacion.idEtapa,
        idEtapaPorSolicitud: asignacion.idEtapaPorSolicitud
      }];
    }

  //console.warn("estadosSolicitud no es un array válido, usando array vacío");
    return [];
  }

  habilitarEtapa() {
    if (this.HabilitarForm.invalid) return;

    const observacion = this.HabilitarForm.value.observacion?.trim() ?? '';
    if (observacion.length < 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Observación insuficiente',
        detail: 'Debe ingresar al menos 50 caracteres en la observación.'
      });
      return;
    }

    const etapaActual = this.asignacionSeleccionada?.idEtapa;
    const tipoSolicitud = this.asignacionSeleccionada?.idTipoSolicitud;
    const etapas = this.asignacionSeleccionada?.estadosSolicitud || [];

    const existeEtapa2 = etapas.some((e: any) => e.idEtapa === 2);
    const existeEtapa3 = etapas.some((e: any) => e.idEtapa === 3);

    let nuevaEtapa: number;
    let nuevoEstado: number;

    if (etapaActual === 1) {
      if (existeEtapa2) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Etapa ya existe',
          detail: 'La Etapa 2 ya fue habilitada.'
        });
        return;
      }

      nuevaEtapa = tipoSolicitud === 10 ? 3 : 2;
      nuevoEstado = tipoSolicitud === 10 ? 15 : 12;

    } else if (etapaActual === 2) {
      if (existeEtapa3) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Etapa ya existe',
          detail: 'La Etapa 3 ya fue habilitada.'
        });
        return;
      }

      nuevaEtapa = 3;
      nuevoEstado = 15;

    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Etapa no válida',
        detail: `No se puede habilitar una nueva etapa desde la etapa actual (${etapaActual}).`
      });
      return;
    }

    const formDatas = {
      idSolicitud: this.asignacionSeleccionada?.idSolicitud,
      idEtapa: nuevaEtapa,
      idEstadoSolicitud: nuevoEstado,
      observacion: observacion,
      estadoActual: this.asignacionSeleccionada?.idEstadoSolicitud,
      usuarioSolicitante: this.asignacionSeleccionada?.usuarioSolicitante,
      rolesAsignados: this.asignacionSeleccionada?.rolesAsignados || ''
    };

  //console.log('Datos enviados al backend:', formDatas);

    this.isLoadingObservacion = true;

    this.AsignacionService.postHabilitarEtapa(formDatas).subscribe({
      next: () => {
        const nuevoEstadoObj = {
          idEtapa: nuevaEtapa,
          idEstadoSolicitud: nuevoEstado,
          idEtapaPorSolicitud: null
        };

        // Prevenir error asegurando que estadosSolicitud esté definido
        if (!Array.isArray(this.asignacionSeleccionada.estadosSolicitud)) {
          this.asignacionSeleccionada.estadosSolicitud = [];
        }

        this.asignacionSeleccionada.estadosSolicitud.push(nuevoEstadoObj);
        this.asignacionSeleccionada.idEtapa = nuevaEtapa;
        this.asignacionSeleccionada.idEstadoSolicitud = nuevoEstado;

        // Actualizar en la lista general
        const index = this.MisAsignaciones.findIndex(
          a => a.idAsignacion === this.asignacionSeleccionada.idAsignacion
        );
        if (index >= 0) {
          this.MisAsignaciones[index] = { ...this.asignacionSeleccionada };
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Etapa habilitada correctamente.'
        });

        // Cerrar todos los modales y limpiar formularios
        this.visibleHabilitar = false;
        this.visibleObservacion = false;
        this.visibleHistorial = false;
        this.visibleIntegrante = false;
        this.visibleDictaminar = false;
        this.modalVisible = false;

        this.HabilitarForm.reset();
        this.cerrarEvaluacion?.(); // por si es una función
        const tipoId =
          this.tipoSolicitudActual === 'Estrategica' ? 1 :
            this.tipoSolicitudActual === 'Curricular' ? 2 :
              this.tipoSolicitudActual === 'Administrativa' ? 3 :
                0; // tipo desconocido

        this.cargarMisAsignaciones(tipoId);
      },
      error: (err) => {
      //console.error('Error al habilitar etapa:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al habilitar la etapa.'
        });
      },
      complete: () => {
        this.isLoadingObservacion = false;
      }
    });
  }

  debeMostrarEvaluacion(rowData: any): boolean {
    const etapaActual = rowData.idEtapa;
    const etapas = this.estadosSeleccionados || [];
    const tipoSolicitud = rowData.idTipoSolicitud;

    const etapa1 = etapas.find(e => e.idEtapa === 1);
    const etapa2 = etapas.find(e => e.idEtapa === 2);
    const etapa3 = etapas.find(e => e.idEtapa === 3);

    // Reglas especiales para solicitudes tipo 10
    if (tipoSolicitud === 10) {
      if (etapaActual === 1) {
        return [10, 21].includes(etapa1?.idEstadoSolicitud);
      }

      if (etapaActual === 3) {
        // Mostrar si etapa 1 está finalizada y etapa 3 está en estado 16 o 23
        return etapa1?.idEstadoSolicitud === 26 &&
          [16, 23].includes(etapa3?.idEstadoSolicitud);
      }

      // Etapa 2 no debe mostrar botón para tipo 10
      return false;
    }

    // Comportamiento general para otras solicitudes
    if (etapaActual === 1) {
      return [10, 21, 5].includes(etapa1?.idEstadoSolicitud);
    }

    if (etapaActual === 2) {
      const condicion1 = (etapa1?.idEstadoSolicitud === 26 && etapa2?.idEstadoSolicitud === 13) || etapa2?.idEstadoSolicitud === 5;
      const condicion2 = etapa2?.idEstadoSolicitud === 22;
      return condicion1 || condicion2;
    }

    if (etapaActual === 3) {
      const condicion1 = (etapa2?.idEstadoSolicitud === 26 && etapa3?.idEstadoSolicitud === 16 || etapa2?.idEstadoSolicitud === 30 && etapa3?.idEstadoSolicitud === 30) || etapa2?.idEstadoSolicitud === 5;
      const condicion2 = etapa3?.idEstadoSolicitud === 23;
      return condicion1 || condicion2;
    }

    return false;
  }

  debeMostrarHabilitarEtapa(rowData: any): boolean {
    const etapaActual = rowData.idEtapa;
    const tipoSolicitud = rowData.idTipoSolicitud;
    const etapas = this.estadosSeleccionados || [];

    const etapa1 = etapas.find(e => e.idEtapa === 1);
    const etapa2 = etapas.find(e => e.idEtapa === 2);
    const etapa3 = etapas.find(e => e.idEtapa === 3);

    // Lógica especial para solicitudes tipo 10
    if (tipoSolicitud === 10) {
      const etapa1Finalizada = etapa1?.idEstadoSolicitud === 26;
      return etapaActual === 1 && etapa1Finalizada && !etapa3;
    }

    // Lógica general para otras solicitudes
    if (etapaActual === 1) {
      return !etapa2;
    }

    if (etapaActual === 2) {
      const etapa1Finalizada = etapa1?.idEstadoSolicitud === 26;
      return etapa1Finalizada && !etapa3;
    }

    return false;
  }


  /* ────────────────────────────────────────────────────────── */
  /*  HELPER: resetFormularioDespuesDeEnviar                    */
  /* ────────────────────────────────────────────────────────── */
  private resetFormularioDespuesDeEnviar(): void {
    this.EvaluarForm.reset();
    this.selectedFiles = [];
    this.nombresArchivos = [];
    this.rutas = [];
    this.Bucket = '';
    this.Location = '';
    this.visibleHabilitar = false;
    this.visibleObservacion = false;
    this.visibleHistorial = false;
    this.visibleIntegrante = false;
    this.visibleDictaminar = false; // Cerrar el modal de dictaminar si estaba abierto
    this.HabilitarForm.reset();
    const tipoId =
      this.tipoSolicitudActual === 'Estrategica' ? 1 :
        this.tipoSolicitudActual === 'Curricular' ? 2 :
          this.tipoSolicitudActual === 'Administrativa' ? 3 :
            0; // tipo desconocido

    this.cargarMisAsignaciones(tipoId);

  }

  // ────────────────────────────────
  // Sección de Observaciones
  // Métodos para manejar observaciones, validaciones y envío
  // ────────────────────────────────

  enviarObservacion(): void {
    this.isLoadingObservacion = true;
    const { observacion } = this.ObservacionForm.value;

    const payload = {
      idSolicitud: this.asignacionSeleccionada.idSolicitud,
      observacion,
      idEstadoSolicitud: 27, // Estado que deseas asignar al actualizar la etapa
      idEtapaPorSolicitud: this.idEtapaPorSolicitud,
      rolesAsignados: this.asignacionSeleccionada?.rolesAsignados || ''
    };

    this.AsignacionService.postAgregarObservacion(payload).subscribe({
      next: () => {

        this.messageService.add({
          severity: 'success',
          summary: 'Observación guardada',
          detail: 'La observación se registró correctamente.'
        });

        this.visibleObservacion = false;
        this.ObservacionForm.reset();


        const tipoId =
          this.tipoSolicitudActual === 'Estrategica' ? 1 :
            this.tipoSolicitudActual === 'Curricular' ? 2 :
              this.tipoSolicitudActual === 'Administrativa' ? 3 :
                0; // tipo desconocido

        this.cargarMisAsignaciones(tipoId);

      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la observación'
        });
        this.isLoadingObservacion = false;
      },
      complete: () => {
        this.isLoadingObservacion = false;
      }
    });
  }

  // ────────────────────────────────
  // Sección de Historial
  // Método para ver el historial de asignaciones
  // ────────────────────────────────

  verHistorial(idSolicitud: number): void {
    this.loadingRevision = true;

    this.AsignacionService.getLogAsignacion(idSolicitud).subscribe({
      next: (res: any[]) => {
        if (res.length > 0) {
          const first = res[0];
          this.nombreSolicitud = first.nombreSolicitud;
          this.ticket = first.ticket;
          this.tipoSolicitud = first.tipoSolicitud;

          this.logEventos = res.map(item => {
            const colores = this.getColoresPorEstado(item.idEstadoSolicitud);

            return {
              fecha: item.fechaModifico ? new Date(item.fechaModifico).toLocaleString('es-HN') : '',
              estado: item.estadoSolicitud,
              usuario: item.usuarioModifico,
              observacion: item.observacion || 'Sin observaciones',
              fechaFinalizacion: item.fechaFinalizacion ? new Date(item.fechaFinalizacion).toLocaleDateString('es-HN') : null,
              fechaRealFinalizacion: item.dfFechaRealFinalizacion ? new Date(item.dfFechaRealFinalizacion).toLocaleDateString('es-HN') : null,
              expanded: false,
              backgroundColor: colores.backgroundColor,
              textColor: colores.textColor
            };
          });
        } else {
          this.logEventos = [];
          this.nombreSolicitud = '';
          this.tipoSolicitud = '';
          this.ticket = '';
        }

        this.loadingRevision = false;
        this.visibleHistorial = true;
      },
      error: (err) => {
      //console.error('Error al obtener historial:', err);
        this.loadingRevision = false;
        this.visibleHistorial = true;
      }
    });
  }

  // Función para mostrar el estado y etapa
  mostrarDetalleEstados(item: any) {
    this.estadosSeleccionados = item.estadosSolicitud || [];
    this.asignacionSeleccionada = item;
    this.modalVisible = true;

    this.estadosSeleccionados.forEach(etapa => {
      const mostrar = this.debeMostrarHabilitarEtapa(etapa);
    });
  }

  tieneEstado(solicitud: any, estadosValidos: number[]): boolean {
  //console.log('Verificando estados de solicitud:', solicitud);
    return solicitud.estadosSolicitud?.some((e: any) => estadosValidos.includes(e.idEstadoSolicitud));
  }

  get observacionValida(): boolean {
    const obs = this.EvaluarForm.get('observacion')?.value || '';
    return obs.trim().length >= 1;
  }

  limpiarModales(): void {
    // Reset de formularios
    this.EvaluarForm.reset();
    this.HabilitarForm.reset();

    // Limpieza del componente de archivo
    if (this.fileUploader && typeof this.fileUploader.clear === 'function') {
      this.fileUploader.clear(); // limpia visualmente los archivos
    }

    // Limpieza de variables de archivos
    this.selectedFiles = [];
    this.nombresArchivos = [];
    this.rutas = [];
    this.Bucket = '';
    this.Location = '';
    this.fileUploaded = false;
    this.archivoSubido = false;
    this.uploadedFiles = [];
    this.loading = false;

    // Cierre de todos los modales
    this.visibleDictaminar = false;
    this.visibleHabilitar = false;
    this.visibleObservacion = false;
    this.visibleHistorial = false;
    this.visibleIntegrante = false;
    this.modalVisible = false;

    // Recargar las asignaciones
    // this.cargarMisAsignaciones(
    //   this.tipoSolicitudActual === 'Estrategica' ? 1 :
    //   this.tipoSolicitudActual === 'Curricular' ? 2 : 3
    // );
  }

    // Evitar palabras que puedan usarse en SQL Injection
sqlInjectionValidator(control: any) {
    if (!control.value) return null;
    const forbidden = /(select|insert|delete|update|drop|alter|create|exec|truncate)/i;
    return forbidden.test(control.value) ? { sqlInjection: true } : null;
  }

  // Capitalizar observación
  formatObservacion(formName: 'EvaluarForm' | 'HabilitarForm' | 'ObservacionForm') {
    let form = this[formName];
    let texto = form.get('observacion')?.value || '';

    texto = texto
      .toLowerCase()
      .replace(/(^\s*\w|[\.:\;]\s*\w)/g, (c: string) => c.toUpperCase());


    form.get('observacion')?.setValue(texto, { emitEvent: false });
  }

  filtrarObservacion(formName: 'EvaluarForm' | 'HabilitarForm' | 'ObservacionForm') {
    let control = this[formName].get('observacion');
    let texto = control?.value || '';

    // 1. Quitar caracteres no permitidos
    texto = texto.split('').filter((c: any) => this.permitidos.test(c)).join('');

    // 2. Eliminar palabras prohibidas (SQL)
    texto = texto.replace(this.palabrasProhibidas, '');

    control?.setValue(texto, { emitEvent: false });
  }
}