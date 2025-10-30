// Angular Core
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../../servicios/seguridad/acceso/permiso/permiso.service';

// Servicios - Solicitud y Archivo
import { SolicitudService } from '../../../../servicios/solicitud/solicitud/solicitud.service';
import { ArchivoService } from '../../../../servicios/archivo/archivo.service';
import { HistorialService } from '../../../../servicios/solicitud/historial/historial.service';
import { ReporteService } from '../../../../servicios/reporte/reporte.service';

// Componentes específicos
import { ContadorComponent } from '../../../diseno/contador/contador.component';
import { HistorialModalComponent } from '../../historial/historial-modal/historial-modal.component';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';
import { ParametroService } from '../../../../servicios/seguridad/parametro/parametro.service';
import { HistorialArchivoComponent } from '../../historial/historial-archivo/historial-archivo.component';

interface asignado{
  idSolicitud: number;
  ticket: string,
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  fechaAsignacion: Date;
}
interface PlantillasYArchivos {
  plantillas: any[];
  archivosSubidos: any[];
}

@Component({
  selector: 'app-mis-solicitudes',
  imports: [PrimeNGImports, AngularImports, HistorialModalComponent, ContadorComponent, HistorialArchivoComponent],
  providers: [MessageService],
  templateUrl: './mis-solicitudes.component.html',
  styleUrl: './mis-solicitudes.component.scss',
})

export class MisSolicitudesComponent implements OnInit {
  @ViewChild('filePopover') filePopover: any;
  @ViewChild('dt') dt: any;
  @Output() loadingCompleted = new EventEmitter<boolean>();
  @ViewChild('historialHijo') historialHijo!: HistorialArchivoComponent;


  solicitud: any[] = [];
  solicitudestado: any = {};
  archivos: any[] = [];
  historialEstados: any[] = [];
  estadosSeleccionados: any[] = [];
  plantillas: any[] = [];
  formatos: any[] = [];
  solicitudSeleccionada: any = null;

  isLoadingArchivos: boolean = false;

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  visibleRevision: boolean = false;
  vibleHistorial: boolean = false;
  visibleAcciones: boolean = false;
  hiddenAsignado: boolean = false;

  loadingtable: boolean = false;
  loadingHistorial: boolean = false;
  loadingRevision: boolean = false;
  loadingRevisionCancelar: boolean = false;
  loadingEtapa: boolean = false;
  modalVisible: boolean = false;
  showError: boolean = false;
  mostrarColumnaSalida: boolean = false;
  isLoadingAsignado: boolean = false;
  visibleAsignados: boolean = false;
  isMobile: boolean = false;
  searchValue: string | undefined;

  idestado: number = 0;
  idestadoActual: number = 0;
  idTipoSolicitud: number = 0;
  idEtapa: number = 0;

  nombreTicketSeleccionado: string = '';
  observacion: string = '';
  loadingBtnKey: string | null = null;

  //Variables para funcionalidad de archivos
  selectedFiles: File[] = [];
  nombresArchivos: string[] = [];
  infoAsignado: asignado[] = [];
  infoAsignadoFiltrado: asignado[] = [];
  fileUploaded: boolean = false;
  rutas: { nombreOriginal: string; key: string }[] = [];
  Bucket: string = '';
  Location: string = '';
  loading: boolean = false;
  archivoSubido = false;

  tipoRevision: 'PRE' | 'FIN' = 'PRE'; // o null si prefieres

  limiteCaracteres = 1000;

  plantillasPorTipoSolicitud: { [key: number]: { [etapa: number]: number[] } } = {
    5: { 1: [3], 2: [4], 3: [6] },
    6: { 1: [3], 2: [5], 3: [6] },
    10: { 1: [3], 3: [6] }
  };

  historialVisible = false;
  idSolicitudSeleccionada!: number;
  loadingDialogGeneral = false;
  ticketSeleccionado: string = '';

  constructor(
    private messageService: MessageService,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private srvSolicitud: SolicitudService,
    private ArchivoService: ArchivoService,
    public srvHistorial: HistorialService,
    private srvReporte: ReporteService,
    private layoutService: LayoutService,
    private srvParametro: ParametroService
  ) { }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.layoutService.setHeader('Mis Solicitudes');
    this.loadingtable = true;
    this.obtenerPermisos();
    this.cargarSolicitudes();
    this.cargarSelects();

    this.isMobile = window.innerWidth <= 768;
  }

  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 768;
  }
  columnasBase = [
    { campo: 'ticket', nombre: 'Ticket' },
    { campo: 'nombreSolicitud', nombre: 'Nombre de la Solicitud' },
    { campo: 'fechaFormateada', nombre: 'Fecha de Registro' },
  ];

  exportarExcel() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dt,
      this.columnasBase,
      'solicitudes'
    );
  }

  exportarPDF() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dt,
      this.columnasBase,
      'solicitudes'
    );
  }

  verificarLimiteCaracteres() {
    // Si deseas forzar un corte puedes hacer:
    if (this.observacion && this.observacion.length > this.limiteCaracteres) {
      this.observacion = this.observacion.slice(0, this.limiteCaracteres);
    }
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 7; // El objeto que estás consultando

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

  clear(table: any) {
    table.clear();
    this.searchValue = ''; // Limpiar el valor del campo de búsqueda
    table.filterGlobal('', 'contains'); // Limpiar el filtro global
  }

  applyFilterGlobal(event: Event, table: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  confirmarEnvioRevision() {
    this.showError = false;

    if (!this.observacion || this.observacion.trim() === '') {
      this.showError = true;
      return;
    }
    const todasEnEstado8 = this.solicitudestado.estadosSolicitud.every(
      (e: any) => e.idEstadoSolicitud === 8
    );
    // Caso especial: estado 8 y revisión final
    if (todasEnEstado8 && this.tipoRevision === 'FIN') {
      const etapas = this.solicitudestado.estadosSolicitud.map(
        (e: any) => e.idEtapa
      );
      this.loadingRevision = true;

      let solicitudesActualizadas = 0;

      etapas.forEach((etapa: any) => {
        const estado = {
          idSolicitud: this.solicitudestado.idSolicitud,
          idEstadoSolicitud: 7,
          idEtapa: etapa,
          observacion: this.observacion.trim(),
        };

        this.srvSolicitud.putEstado(estado).subscribe({
          next: () => {
            solicitudesActualizadas++;
            if (solicitudesActualizadas === etapas.length) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Las 3 etapas fueron enviadas a revisión final',
              });

              // Limpieza general
              this.hideModalRevision(); // Cerrar el modal de revisión
              this.loadingRevision = false;
              this.observacion = '';
              this.modalVisible = false; // Cerrar el modal de detalles
              this.nombresArchivos = [];
              (this.Location = ''), (this.rutas = []), (this.Bucket = '');
              this.selectedFiles = [];
              this.nombresArchivos = [];
              this.archivoSubido = false;
              this.cargarSolicitudes(); // o refrescar tabla

              this.nombresArchivos = [];
              this.selectedFiles = [];
              this.archivoSubido = false; // Asegúrate de resetear la bandera también
              this.nombresArchivos = [];
              (this.Location = ''), (this.rutas = []), (this.Bucket = '');

            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al actualizar una etapa: ${err?.message || ''}`,
            });
            this.loadingRevision = false;
          },
        });
      });

      return; // No continuar con lógica normal
    }

    // Lógica normal para cualquier otro caso
    this.putEstadoSolicitud(this.solicitudestado);
  }


  todasLasEtapasEnEstado8(): boolean {
    return (
      this.estadosSeleccionados?.length > 0 &&
      this.estadosSeleccionados.every((e: any) => e.idEstadoSolicitud === 8)
    );
  }

  hideModalRevision() {
    this.showError = false;
    this.visibleRevision = false; // Cerrar el modal de revisión
    this.solicitudestado = {}; // Limpiar la solicitud seleccionada
    this.observacion = ''; // Limpiar la observación
  }

  getTextoEstado(idEstado: number, enlace?: string): string {
    const map: { [key: number]: string } = {
      9: 'Plan de Diagnóstico',
      11: 'Plan de Diagnóstico',
      12: 'Plan de Factibilidad',
      14: 'Plan de Factibilidad',
      15: 'Plan de Estudio',
      17: 'Plan de Estudio',
    };

    if (!enlace || enlace.trim() === '') {
      return 'Enlace No Disponible';
    }
    return map[idEstado] || 'Enlace No Disponible';
  }

  tieneAccionesDisponibles(rowData: any): boolean {
    const puedeRevisionPreliminar = [9, 12, 15].includes(rowData.idEstadoSolicitud);
    const puedeRevisionFinal = [9, 11, 12, 14, 15, 17, 8].includes(rowData.idEstadoSolicitud);
    return puedeRevisionPreliminar || puedeRevisionFinal;
  }


  mostrarColumnaAccion(): boolean {
    if (!this.permisoActualizar || !this.estadosSeleccionados) return false;
    return this.estadosSeleccionados.some(row => this.tieneAccionesDisponibles(row));
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
  cargarSelects(): void {
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


  cargarArchivos(event: Event, nombreArchivo: string, key: string, bucket: string): void {
    this.loadingBtnKey = key;

    this.ArchivoService.getArchivos(key, bucket).subscribe(
      (response) => {
        const nombres = nombreArchivo.split(',').map((n) => n.trim());
        this.archivos = response.map((res: any, index: number) => {
          const nombre = nombres[index]
            ? nombres[index]
            : `Archivo ${index + 1}`;
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

  descargarArchivo(url: string, nombre: string) {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('Error al obtener el archivo');
        return response.blob(); // Convertir la respuesta en un blob
      })
      .then((blob) => {
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
      .catch((error) => {
        ////console.error('Error al descargar el archivo:', error);
      });
  }

  getfiles(event: any): void {
    const files = Array.from(event.files) as File[];
    if (files.length === 0) {
      this.archivoSubido = false;
      return;
    }
    this.selectedFiles = files;
    this.nombresArchivos = this.selectedFiles.map((file) => file.name);
    this.archivoSubido = true; // Se marca como subido
    this.sendfiles();
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

  getPlantillasPorEtapa(idEtapa: number): PlantillasYArchivos {
    const tipo = this.solicitudSeleccionada?.idTipoSolicitud;
    const parametros = this.plantillasPorTipoSolicitud[tipo]?.[idEtapa] || [];
    const plantillas = this.plantillas.filter(p => parametros.includes(p.idParametro));

    // Obtener archivos subidos para esta etapa
    const archivosSubidos = this.solicitudSeleccionada?.archivosPlantilla
      ?.filter((a: any) => a.idTipoDocumento === idEtapa)
      ?.sort((a: any, b: any) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()) || [];

    return {
      plantillas,
      archivosSubidos
    };
  }

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────

  cargarSolicitudes(): void {
    this.loadingtable = true;

    this.srvSolicitud.getSolicitudUsuario().subscribe(
      (data: any[]) => {
        this.solicitud = data.map((item: any, index: number) => {
          // Separar archivos recientes en entrada y salida según idTipoArchivo
          const archivosEntrada = item.archivosRecientes?.filter((a: any) => a.idTipoArchivo === 1) || [];
          item.archivosRecientes?.filter((a: any) => a.idTipoArchivo === 1) || [];
          const archivosSalida = item.archivosRecientes?.filter((a: any) => a.idTipoArchivo === 2) || [];

        //console.log('archivosEntrada en getSolicitudes : ', archivosEntrada);
        //console.log('archivosSalida en getSolicitudes : ', archivosSalida);
          const asignado = item.asignado?.[0] || null;
          if (asignado) {
            this.infoAsignado.push({
              idSolicitud: item.idSolicitud,
              ticket: item.ticket,
              nombreCompleto: asignado.nombre,
              correoElectronico: asignado.correo,
              telefono: asignado.telefono,
              fechaAsignacion: item.fechaAsignacion
                ? new Date(item.fechaAsignacion)
                : new Date(item.fechaRegistro),
            });
          }

        //console.log('asignados : ', this.infoAsignado);

          // Archivos de plantilla
          const archivosPlantilla = item.archivosPlantillas || [];

          return {
            numero: index + 1,
            ...item,
            archivosEntrada,
            archivosSalida,
            archivosPlantilla,
            fechaRegistro: new Date(item.fechaRegistro),
            fechaFormateada: new Intl.DateTimeFormat('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(new Date(item.fechaRegistro)),
            
          };
        });

        // Mostrar columna de salida si al menos una solicitud tiene archivo de salida
        this.mostrarColumnaSalida = this.solicitud.some(
          (s) => s.archivosSalida && s.archivosSalida.length > 0
        );

        // Mostrar acciones según estados permitidos
        const estadosPermitidos = [9, 11, 12, 14, 15, 17];
        this.visibleAcciones = this.solicitud.some((s) =>
          s.estadosSolicitud.some((e: any) => estadosPermitidos.includes(e.idEstadoSolicitud))
        );

      //console.log('Solicitudes cargadas:', this.solicitud);
        this.loadingtable = false;
        this.loadingCompleted.emit(true);
      },
      (error) => {
        this.loadingtable = false;
        this.loadingCompleted.emit(true);
      }
    );
  }


  mostrarHistorials(idSolicitud: number, ticket: string, idEtapa?: number): void {
    this.loadingHistorial = true;

    this.srvHistorial.getHistorial(idSolicitud, idEtapa).subscribe((data) => {
      this.historialEstados = data;
      this.vibleHistorial = true;
      this.loadingHistorial = false;
      this.nombreTicketSeleccionado = ticket; // asignas el nombre
    });
  }



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

  mostrarDetalleEstados(item: any) {
    this.loadingEtapa = true; // activa spinner

    // Simular un pequeño delay para representar carga
    setTimeout(() => {
      this.estadosSeleccionados = item.estadosSolicitud || [];
      this.solicitudSeleccionada = item;
      this.modalVisible = true; // mostrar el modal
      this.loadingEtapa = false; // desactiva spinner
    }); // ajusta el tiempo según necesidad
  }

  mostrarmodalRevision(solicitud: any, tipoRevision: 'PRE' | 'FIN') {
    const estadosPermitidos = [9, 11, 12, 14, 15, 17, 8];
    // 1. Validación básica
    if (!estadosPermitidos.includes(solicitud.idEstadoSolicitud)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Estado no válido para revisión',
      });
      return;
    }
    this.tipoRevision = tipoRevision;
    // 2. Guarda la solicitud y etapa actual
    this.solicitudestado = this.solicitudSeleccionada;
    this.idEtapa = solicitud.idEtapa;

    // 3. Mapa de flujos PRE vs FIN para cada estado actual
    const flujo: {
      [idActual: number]: { PRE: number; FIN: number };
    } = {
      9: { PRE: 21, FIN: 10 },
      11: { PRE: 21, FIN: 10 },
      12: { PRE: 22, FIN: 13 },
      14: { PRE: 22, FIN: 13 },
      15: { PRE: 23, FIN: 16 },
      17: { PRE: 23, FIN: 16 },
      8: { PRE: 7, FIN: 7 }, // Para el caso especial de estado 8
    };

    // 4. Busca el estado actual dentro de la etapa
    const estadoActualEtapa = solicitud.idEstadoSolicitud;
    this.idestadoActual = estadoActualEtapa; // Guardar el estado actual
    const destinos = flujo[estadoActualEtapa!];
    if (!destinos) {
      return this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No existe flujo de revisión para este estado',
      });
    }

    // 5. Selecciona PRE o FIN
    this.idestado = tipoRevision === 'PRE' ? destinos.PRE : destinos.FIN;

    // 6. Muestra el modal
    this.visibleRevision = true;
  }

  tieneAsignado(idSolicitud: number): boolean {
    return this.infoAsignado.some(a => a.idSolicitud === idSolicitud);
  }

  mostrarAsignado(idSolicitud: number): void {
    this.isLoadingAsignado = true;

    try {
      this.infoAsignadoFiltrado = this.infoAsignado.filter(
        (a) => a.idSolicitud === idSolicitud
      );
      this.visibleAsignados = true;
      this.isLoadingAsignado = false;
    } catch (error) {
      this.isLoadingAsignado = false;
      // Silencioso por ahora, para desarrollo puedes descomentar:
      // console.error('Error al filtrar asignado:', error);
    } finally {
      this.isLoadingAsignado = false;
    }
  }

  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // Cambio de Estado de la Solicitud
  // ────────────────────────────────


  tieneEstado(solicitud: any, estadosValidos: number[]): boolean {
    return solicitud.estadosSolicitud?.some((e: any) =>
      estadosValidos.includes(e.idEstadoSolicitud)
    );
  }

  // putEstadoSolicitud(solicitud: any) {
  //   //console.log('Solicitud a actualizar:', solicitud);

  //   this.loadingRevision = true; // Mostrar el spinner de carga
  //   let estado = {
  //     idSolicitud: solicitud.idSolicitud,
  //     idEstadoSolicitud: this.idestado, // Estado de "En revisión"
  //     idEtapa: this.idEtapa, // Mantener la etapa actual,
  //     observacion: this.observacion, // Mantener la observación
  //   };
  //   //console.log('Estado a actualizar:', estado);
  //   this.srvSolicitud.putEstado(estado).subscribe(
  //     (response) => {
  //       solicitud = {
  //         ...solicitud,
  //         tipoRevision: this.tipoRevision, // Mantener el tipo de revisión
  //       };
  //       this.srvSolicitud.postEnviarCorreoAsignado(solicitud).subscribe({
  //         next: () => {
  //           this.messageService.add({
  //             severity: 'success',
  //             summary: 'Éxito',
  //             detail: 'Estado actualizado correctamente',
  //           });
  //           this.solicitudestado = []; // Limpiar la solicitud seleccionada
  //           this.idestado = 0; // Reiniciar el idestado
  //           this.cargarSolicitudes();
  //           this.loadingRevision = false; // Ocultar el spinner de carga
  //           this.visibleRevision = false; // Cerrar el modal de revisión
  //           this.idEtapa = 0; // Reiniciar la etapa
  //           this.solicitudSeleccionada = []; // Limpiar la solicitud seleccionada
  //           this.modalVisible = false; // Cerrar el modal de detalles
  //           this.observacion = ''; // Limpiar la observación
  //         },
  //         error: (err) => {
  //           // Puedes dejarlo vacío o registrar en consola solo para desarrolladores
  //           //console.error('Error al enviar correo (silencioso):', err);
  //           this.loadingRevision = false; // Ocultar el spinner de carga
  //           this.messageService.add({
  //             severity: 'error',
  //             summary: 'Error',
  //             detail: 'Error al enviar correo',
  //           });
  //         },
  //       });
  //     },
  //     (error) => {
  //       this.loadingRevision = false; // Ocultar el spinner de carga
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Error al actualizar el estado',
  //       });
  //     }
  //   );
  // }

  putEstadoSolicitud(solicitud: any) {
    this.loadingRevision = true; // Mostrar spinner de carga

    // Datos que quieres enviar además de los archivos
    const formdata = {
      idSolicitud: solicitud.idSolicitud,
      idEstado: this.idestado, // Estado "En revisión"
      idEtapa: this.idEtapa,            // Etapa actual
      observacion: this.observacion,    // Observaciones
    };

    const formDatas = new FormData();

    // Agregar archivos seleccionados (campo 'image' porque así lo espera el backend)
    this.selectedFiles.forEach(file => {
      formDatas.append("image", file, file.name);
    });

    // Agregar los demás campos dinámicamente
    Object.entries(formdata).forEach(([key, value]) => {
      formDatas.append(key, value as any);
    });

    // Llamar al servicio
    this.srvSolicitud.putEstadoPlantilla(formDatas).subscribe(
      (response) => {
        solicitud = {
          ...solicitud,
          tipoRevision: this.tipoRevision, // Mantener tipo de revisión
        };

        // Enviar correo
        this.srvSolicitud.postEnviarCorreoAsignado(solicitud).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Éxito",
              detail: "Estado actualizado correctamente",
            });
            // Reset de variables y limpiar estados
            this.solicitudestado = [];
            this.idestado = 0;
            this.cargarSolicitudes();
            this.loadingRevision = false;
            this.visibleRevision = false;
            this.idEtapa = 0;
            this.solicitudSeleccionada = [];
            this.modalVisible = false;
            this.observacion = "";

            this.nombresArchivos = [];
            this.selectedFiles = [];
            this.archivoSubido = false; // Asegúrate de resetear la bandera también
            this.nombresArchivos = [];
            (this.Location = ''), (this.rutas = []), (this.Bucket = '');
          },
          error: (err) => {
            this.loadingRevision = false;
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Error al enviar correo",
            });
          },
        });
      },
      (error) => {
        this.loadingRevision = false;
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Error al actualizar el estado",
        });
      }
    );
  }


}
