// Angular Core
import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';


// Librerías externas
import { MessageService } from 'primeng/api';

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
import { HistorialModalComponent } from '../historial-modal/historial-modal.component';

@Component({
  selector: 'app-historial-solicitudes',
  imports: [PrimeNGImports, AngularImports, HistorialModalComponent],
  providers: [MessageService],
  templateUrl: './historial-solicitudes.component.html',
  styleUrl: './historial-solicitudes.component.scss'
})
export class HistorialSolicitudesComponent implements OnInit {

  @ViewChild('filePopover') filePopover: any;
  @ViewChild('dtAdministrativa') dtAdministrativa: any;
  @ViewChild('dtCurricular') dtCurricular: any;
  @ViewChild('dtEstrategica') dtEstrategica: any;

  ticket: string = '';
  nombreSolicitud: string = '';
  nombreSubComision: string = '';
  tipoSolicitudActual: string = '';
  tipoSolicitud: string = '';
  nombreTicketSeleccionado: string = '';
  globalFilter: string = '';

  solicitudSeleccionada: any;
  solicitudEstrategica: any[] = [];
  solicitudCurricular: any[] = [];
  solicitudAdministrativa: any[] = [];
  integrantes: any[] = [];
  asignado: any[] = [];
  archivos: any[] = [];
  usuariosTotales: any[] = [];
  usuariosDisponibles: any[] = [];
  listaSolicitudes: any[] = [];
  historialEstados: any[] = [];
  estadosSeleccionados: any[] = [];

  loadingSolicitudEstrategica: boolean = false;
  loadingSolicitudCurricular: boolean = false;
  loadingSolicitudAdministrativa: boolean = false;

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  searchValue: string | undefined;

  loadingtable: boolean = false;
  loadingDialogGeneral: boolean = false;
  loadingDialogIntegrante: boolean = false;
  loadingDialogAsignado: boolean = false;
  isLoadingArchivos: boolean = false;
  loadingEtapa: boolean = false;
  loadingHistorial: boolean = false;

  loadingBtnKey: string | null = null;

  visibleIntegrante: boolean = false;
  visibleAsignados: boolean = false;
  visibleEtapas: boolean = false;

  mostrarHistorial: boolean = false;
  mostrarColumnaSalida: boolean = false;
  mostrarColumnaEnlace: boolean = false;


  activeTab: number = 0;
  rolesUsuario: number[] = [];
  idEstadoSolicitud: number = 0;
  idTitulosSolicitud: number[] = [];

  //Variables para funcionalidad de archivos
  selectedFiles: File[] = [];
  nombresArchivos: string[] = [];
  fileUploaded: boolean = false;
  rutas: { nombreOriginal: string; key: string }[] = [];
  Bucket: string = '';
  Location: string = '';
  loading: boolean = false;
  archivoSubido = false;

  minDate: Date | null = null;
  tabActivoIndex: number = 0;
  disabledDays: number[] = [0, 6];

  constructor(
    private messageService: MessageService,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private SolicitudService: SolicitudService,
    private ComisionService: ComisionService,
    private ArchivoService: ArchivoService,
    private AsignacionService: AsignacionService,
    public srvHistorial: HistorialService,
    private srvReporte: ReporteService
  ) {
  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.loadingtable = false;
    this.obtenerPermisos();
    this.cargarSolicitudEstrategicas();


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
      'solicitudes-administrativas'
    );
  }

  exportarPDFCurricular() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dtCurricular,
      this.columnasBase,
      'solicitudes-curriculares'
    );
  }

  exportarPDFEstrategica() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dtEstrategica,
      this.columnasBase,
      'solicitudes-estrategicas'
    );
  }
  exportarExcelAdministrativa() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dtAdministrativa,
      this.columnasBase,
      'solicitudes-administrativas'
    );
  }

  exportarExcelCurricular() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dtCurricular,
      this.columnasBase,
      'solicitudes-curriculares'
    );
  }

  exportarExcelEstrategica() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dtEstrategica,
      this.columnasBase,
      'solicitudes-estrategicas'
    );
  }
  //Funcion para mostrar el historial
  mostrarHistorials(idSolicitud: number, ticket: string) {
    this.loadingHistorial = true;

    this.srvHistorial.getHistorial(idSolicitud).subscribe(data => {
      this.historialEstados = data;
      this.mostrarHistorial = true;
      this.loadingHistorial = false;
      this.nombreTicketSeleccionado = ticket; // asignas el nombre
    });
  }


  verEtapas(solicitud: any) {
    this.solicitudSeleccionada = solicitud;
    this.estadosSeleccionados = solicitud.estadosSolicitud;

    // Evaluar si al menos un estado tiene un enlace válido
    this.mostrarColumnaEnlace = this.estadosSeleccionados.some(
      estado => estado.enlace && estado.enlace.trim() !== ''
    );

    this.visibleEtapas = true;
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    this.rolesUsuario = roles; // Guardas los roles
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
  showDialog(dialogType: 'Integrante' | 'Asignados') {
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
      (file) => file !== fileToRemove
    );
    // Eliminar la ruta correspondiente del archivo
    this.rutas = this.rutas.filter(
      (item) => item.nombreOriginal !== fileToRemove
    );
  }

  descargarPlantilla(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.target = '_blank';
    link.click();
  }

   getArchivosPlantillaPorEtapa(etapa: number): any[] {
  if (!this.solicitudSeleccionada?.archivosPlantilla) return [];
  return this.solicitudSeleccionada.archivosPlantilla
    .filter((a: any) => a.idTipoDocumento === etapa)
    .sort(
      (a: any, b: any) =>
        new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
    )
    .slice(0, 1); // 👉 solo la más reciente por etapa
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



  cargarSolicitudEstrategicas(): void {
    this.loadingSolicitudEstrategica = true;
    this.SolicitudService.getHistoralSolicitud().subscribe(
      (response: any[]) => {
        const tieneRol5 = this.rolesUsuario.includes(5);

        this.solicitudEstrategica = response
          .filter((solicitud) => {
            const tipoValido = [1, 3, 4].includes(solicitud.idTipoSolicitud);
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
        this.showErrorMessage(error);
      }
    );
  }


  cargarSolicitudCurricular(): void {
    this.loadingSolicitudCurricular = true;

    this.SolicitudService.getHistorialSolicitudCurricular().subscribe(
      (response: any[]) => {
        const tieneRol5 = this.rolesUsuario.includes(5);

        this.solicitudCurricular = response
          .filter((solicitud) => {
            // Filtrar por tipo de solicitud válido
            const tipoValido = [5, 6, 10, 11].includes(solicitud.idTipoSolicitud);
            if (!tipoValido) return false;

            // Mostrar estado 1 solo si tiene rol 5
            if (tieneRol5) return true;

            // Si no tiene rol 5, excluir solicitudes en estado 1
            return solicitud.idEstadoSolicitud !== 1;
          })
          .map((solicitud, index) => {
            // Separar archivos recientes en entrada y salida
            const archivosEntrada = solicitud.archivosRecientes?.filter((a: any) => a.idTipoArchivo === 1) || [];
            const archivosSalida = solicitud.archivosRecientes?.filter((a: any) => a.idTipoArchivo === 2) || [];

            return {
              numero: index + 1,
              ...solicitud,
              archivosEntrada,
              archivosSalida,
              archivosPlantilla: solicitud.archivosPlantilla || []
            };
          });

        // Mostrar columna de salida si hay al menos un archivo de salida
        this.mostrarColumnaSalida = this.solicitudCurricular.some(solicitud =>
          solicitud.archivosSalida && solicitud.archivosSalida.length > 0
        );

        this.loadingSolicitudCurricular = false;
      },
      (error) => {
        this.loadingSolicitudCurricular = false;
        this.showErrorMessage(error);
      }
    );
  }

  cargarSolicitudAdministrativa(): void {
    this.loadingSolicitudAdministrativa = true;
    this.SolicitudService.getHistoralSolicitud().subscribe(
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

        this.mostrarColumnaSalida = this.solicitudEstrategica.some(solicitud =>
          solicitud.archivos.some((archivo: any) => archivo.idTipoArchivo === 2)
        );

        this.loadingSolicitudAdministrativa = false;
      },
      (error) => {
        this.loadingSolicitudAdministrativa = false;
        this.showErrorMessage(error);
      }
    );
  }



  // ────────────────────────────────
  // Sección de Carga de Datos para Diálogos
  // Integrantes, Asignaciones, Revisiones y Mantención de Solicitudes
  // ────────────────────────────────
  loadingSolicitudId: number | null = null; // ID del botón que está cargando

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
  cargarAsigandosSolicitud(solicitud: any, tipo: 'Asignados'): void {
    this.loadingDialogGeneral = true;

    if (tipo === 'Asignados') {
      // Aquí cargarías los integrantes
      this.loadingDialogAsignado = true;
      this.AsignacionService.getUsuariosAsignadosTicket(solicitud.idSolicitud).subscribe(
        (response: any) => {
          this.asignado = response.map((asignado: any, index: number) => ({
            numero: index + 1,
            ...asignado,
          }));
          this.ticket = solicitud.ticket;
          this.loadingDialogGeneral = false;
          this.loadingDialogAsignado = false;
          setTimeout(() => {
            this.showDialog(tipo);
          }, 0);
        },
        (error) => {
          this.loadingDialogGeneral = false;
          this.loadingDialogAsignado = false;
          this.showErrorMessage(error);
        }
      );
    }
  }

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

  loadingInformacion = false
  visibleInformacion: boolean = false;

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



}
