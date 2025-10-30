// Angular Core
import { Component, ViewChild } from '@angular/core';

// Angular Forms
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { UsuarioService } from '../../../../servicios/seguridad/usuario/usuario.service';

// Servicios - Solicitud
import { TicketService } from '../../../../servicios/solicitud/ticket/ticket.service';
import { HistorialService } from '../../../../servicios/solicitud/historial/historial.service';


// Componentes
import { HeaderPanelComponent } from '../../../diseno/header/header-panel/header-panel.component';


@Component({
  selector: 'app-consultar-tickets',
  imports: [PrimeNGImports, AngularImports, HeaderPanelComponent],
  providers: [MessageService],
  templateUrl: './consultar-tickets.component.html',
  styleUrl: './consultar-tickets.component.scss'
})

export class ConsultarTicketsComponent {

  @ViewChild('filePopover') filePopover: any;

  ConsultarForm: FormGroup;
  ActualizarForm: FormGroup;

  isLoadingConsultar: boolean = false;
  isLoadingActualizar: boolean = false;
  loadingEtapa: boolean = false;

  visibleActualizar: boolean = false;
  visibleEtapas: boolean = false;

  mostrarTabla: boolean = false;
  mensajeAdvertencia: boolean = false;

  mostrarColumnaArchivos: boolean = false;
  mostrarColumnaSalida: boolean = false;

  estadosSeleccionados: any[] = [];
  estadoTicket: any = null;

  solicitudSeleccionada: any;

  ticketTemporal: string | null = null;
  correoTemporal: string | null = null;


  //Variables para funcionalidad de archivos
  selectedFiles: File[] = [];
  nombresArchivos: string[] = [];
  fileUploaded: boolean = false;
  rutas: { nombreOriginal: string; key: string }[] = [];
  Bucket: string = '';
  Location: string = '';
  loading: boolean = false;
  archivoSubido = false;
  loadingBtnKey: string | null = null;
  archivos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private TicketService: TicketService,
    private MessageService: MessageService,
    private AuthService: AuthService,
    private UsuarioService: UsuarioService,
    public srvHistorial: HistorialService,
  ) {
    // Formulario para consulta de estado
    this.ConsultarForm = this.fb.group({
      ticket: ['', Validators.required],
      correo: [null, [Validators.required, Validators.email]],
    });
    this.ActualizarForm = this.fb.group({
      primerNombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+$')]],
      segundoNombre: ['', [
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+)?$/)
      ]],
      primerApellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+$')]],
      segundoApellido: ['', [
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+)?$/)]
      ],
      telefono: ['', Validators.required],
    });

  }


  // ────────────────────────────────
  // Sección de Utilidades Generales
  //  Diálogos y Manejo de Errores
  // ────────────────────────────────

  onModalHide(): void {
    // Solo limpiar, sin hacer consulta
    this.ticketTemporal = null;
    this.correoTemporal = null;
  }

  descargarBase64(archivo: any) {
    const link = document.createElement('a');
    link.href = archivo.archivoBase64;
    link.download = archivo.nombreArchivo;
    link.click();
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

    showErrorMessage(message: string) {
    this.MessageService.add({
      severity: 'error',
      summary: 'Operación Fallida',
      detail: message,
      life: 3000
    });
  }

  // ────────────────────────────────
  // Sección de Funciones para Integración con servicios Backend (APIs)
  // ────────────────────────────────
  private realizarConsultaTicket(ticket: string, correo: string): void {
    this.TicketService.getTicket(ticket, correo).subscribe({
      next: (data: any) => {
        const result = data[0];

        if (!result || result.mensaje?.includes("No se puede consultar esta solicitud")) {
          // Caso en que explícitamente no se debe mostrar la solicitud
          this.mostrarTabla = false;
          this.mensajeAdvertencia = true;
          this.estadoTicket = null;
        }
        else if (result.idSolicitud) {
          // Si la respuesta contiene una solicitud válida, procesamos y mostramos
          const archivosEntrada = result.archivos?.filter((a: any) => a.idTipoArchivo === 1) || [];
          const archivosSalida = result.archivos?.filter((a: any) => a.idTipoArchivo === 2) || [];

          this.estadoTicket = [{
            ...result,
            archivosEntrada,
            archivosSalida
          }];

          this.mostrarColumnaArchivos = archivosSalida.length > 0;
          this.mostrarColumnaSalida = result.archivos?.some((a: any) => a.idTipoArchivo === 2) || false;

          this.mostrarTabla = true;
          this.mensajeAdvertencia = false;
        }
        else {
          // No hay datos válidos para mostrar
          this.mostrarTabla = false;
          this.MessageService.add({
            severity: "warn",
            summary: "Aviso",
            detail: result.mensaje || "No se encontró información.",
          });
        }

        this.isLoadingConsultar = false;
        this.AuthService.logouts();

      },
      error: () => {
        this.mostrarTabla = false;
        this.ConsultarForm.reset();
        this.MessageService.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo obtener el estado del ticket.",
        });
        this.isLoadingConsultar = false;
        this.AuthService.logouts();
      },
    });
  }

  consultarTicket(): void {
    if (this.ConsultarForm.invalid) {
      this.MessageService.add({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Por favor complete todos los campos requeridos.",
      });
      return;
    }

    this.isLoadingConsultar = true;
    const ticket = this.ConsultarForm.get("ticket")?.value;
    const correo = this.ConsultarForm.get("correo")?.value;

    this.AuthService.postLoginTicket(correo, ticket).subscribe({
      next: (response: any) => {
        if (response?.mensaje === "Éxito" && response.token) {
          this.AuthService.setToken(response.token);
          const roles = this.AuthService.getRolesFromToken();

          if (Array.isArray(roles)) {
            // Obtener la solicitud para verificar estado
            this.TicketService.getTicket(ticket, correo).subscribe({
              next: (data: any) => {
                const result = data[0];

                if (!result || result.mensaje?.includes("No se puede consultar esta solicitud")) {
                  this.mostrarTabla = false;
                  this.mensajeAdvertencia = true;
                  this.estadoTicket = null;
                  this.isLoadingConsultar = false;
                  this.AuthService.logouts();
                  return;
                }

                const estados = result.estadosSolicitud ?? [];
                // Verificar que todos estén en estado 18
                const todosEnEstado18 = estados.every((e: any) => e.idEstadoSolicitud === 18);

                const archivosEntrada = result.archivos?.filter((a: any) => a.idTipoArchivo === 1) || [];
                const archivosSalida = result.archivos?.filter((a: any) => a.idTipoArchivo === 2) || [];

                this.estadoTicket = [{
                  ...result,
                  archivosEntrada,
                  archivosSalida
                }];

                this.mostrarColumnaArchivos = archivosSalida.length > 0;
                this.mostrarColumnaSalida = archivosSalida.length > 0;

                this.mostrarTabla = true;
                this.mensajeAdvertencia = false;

                // Aquí decides si mostrar modal o consultar directo
                if (roles.includes(17) && !todosEnEstado18) {
                  this.visibleActualizar = true;
                  this.ticketTemporal = ticket;
                  this.correoTemporal = correo;
                  this.isLoadingConsultar = false; // Para que no quede cargando mientras modal
                  // NO logout aquí para no perder token antes de hacer consulta final
                } else {
                  // Ya está dictaminado o no tiene rol 17 → consultar directo
                  this.isLoadingConsultar = false;
                  this.realizarConsultaTicket(ticket, correo);
                }
              },
              error: () => {
                this.mostrarTabla = false;
                this.MessageService.add({
                  severity: "error",
                  summary: "Error",
                  detail: "No se pudo obtener el estado del ticket.",
                });
                this.isLoadingConsultar = false;
                this.AuthService.logouts();
              },
            });
          } else {
            // No roles o roles inválidos
            this.isLoadingConsultar = false;
            this.AuthService.logouts();
          }
        } else {
          this.mostrarTabla = false;

          this.MessageService.add({
            severity: "error",
            summary: "Autenticación fallida",
            detail: "Correo o ticket incorrecto.",
          });
          this.isLoadingConsultar = false;
        }
      },
      error: () => {
        this.mostrarTabla = false;

        this.MessageService.add({
          severity: "error",
          summary: "Autenticación fallida",
          detail: "Correo o ticket incorrecto.",
        });
        this.isLoadingConsultar = false;
      },
    });
  }

  actualizarCredencialPersona() {
    this.isLoadingActualizar = true;
    const formdata = this.ActualizarForm.value;

    this.UsuarioService.putCredencialPersona(formdata).subscribe(
      (res: any) => {
        this.ActualizarForm.reset();
        this.visibleActualizar = false;
        this.isLoadingActualizar = false;
        this.MessageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Credenciales actualizadas exitosamente',
          life: 3000
        });

        // Luego de actualizar, consultar el ticket
        if (this.ticketTemporal && this.correoTemporal) {
          this.isLoadingConsultar = true;
          this.realizarConsultaTicket(this.ticketTemporal, this.correoTemporal);
          this.ticketTemporal = null;
          this.correoTemporal = null;
        }

      },
      (error: any) => {
        this.isLoadingActualizar = false;
        const msg = error.error?.mensaje || 'Error al actualizar las credenciales';
        this.MessageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  // ────────────────────────────────
  // Sección de Gestión de Archivos
  // Métodos para cargar, descargar, seleccionar, enviar y eliminar archivos
  // Incluye manejo de estado y control de interfaz (popover, nombres, rutas)
  // ───────────────────────────────────────────────────────────

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

  mostrarColumnasArchivos(ticket: any): boolean {
    const estados = ticket.estadosSolicitud || [];
    const estadosDictaminados = estados.filter((e: any) => e.idEstadoSolicitud === 18);

    const cantidadDictaminados = estadosDictaminados.length;

    switch (ticket.idTipoSolicitud) {
      case 5:
      case 6:
        return cantidadDictaminados === 3;
      case 10:
        return cantidadDictaminados === 2;
      default:
        return cantidadDictaminados === 1;
    }
  }

  tieneAlgunoConArchivos(): boolean {
    return this.estadoTicket?.some((t: any) => this.mostrarColumnasArchivos(t));
  }

}