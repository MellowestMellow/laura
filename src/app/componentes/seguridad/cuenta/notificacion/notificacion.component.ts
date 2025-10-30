// Angular Core
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { UsuarioService } from '../../../../servicios/seguridad/usuario/usuario.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';

@Component({
  selector: 'app-notificacion',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './notificacion.component.html',
  styleUrl: './notificacion.component.scss'
})
export class NotificacionComponent implements OnInit {

  @Output() loadingCompleted = new EventEmitter<boolean>();

  first = 0;
  rows = 10;

  searchValue: string | undefined;
  isLoadingMarcarLeido: boolean = false;

  loadingtable: boolean = false;
  notificacion: any[] = [];
  notificaciones: any[] = [];
  recordatorios: any[] = [];


  activeTab = 0;

  constructor(
    private UsuarioService: UsuarioService,
    private MessageService: MessageService,
    private layoutService: LayoutService
  ) { }


  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit() {
    this.layoutService.setHeader('Notificacion');
    this.cargarNotificaciones();
    this.UsuarioService.refreshNotificaciones();
  }

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }

  showErrorMessage(message: string) {
    this.MessageService.add({
      severity: 'error',
      summary: 'Operación Fallida',
      detail: message,
      life: 3000
    });
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

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────
  cargarNotificaciones(): void {
    this.loadingtable = true;
    this.UsuarioService.getNotificaciónUsuario().subscribe(
      (response: any[]) => {
        const parsedNotificaciones = response.map(n => ({
          ...n,
          fechaRegistro: new Date(n.fechaRegistro)
        }));

        // Notificaciones = tipo ≠ 12 y no leídas
        this.notificaciones = parsedNotificaciones
          .filter(n => n.idTipoNotificacion !== 12)
          .map((n, index) => ({ ...n, numeros: index + 1 }));

        // Recordatorios = tipo = 12
        this.recordatorios = parsedNotificaciones
          .filter(n => n.idTipoNotificacion === 12)
          .map((n, index) => ({ ...n, numeros: index + 1 }));

        this.loadingtable = false;
        this.loadingCompleted.emit(true);
      },
      () => {
        this.loadingtable = false;
        this.loadingCompleted.emit(true);
      }
    );
  }

  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // Marcar Notificacion
  // ────────────────────────────────
  marcarNotificacion() {
    this.isLoadingMarcarLeido = true;
    this.UsuarioService.putNotificacionUsuarioLeidas().subscribe(
      () => {
        this.cargarNotificaciones();
        this.MessageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Notificaciones marcadas como leídas.',
          life: 3000
        });
        this.isLoadingMarcarLeido = false;
      },
      (error: any) => {
        const msg = error.error?.mensaje || 'Error al marcar las notificaciones';
        this.MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: msg,
          life: 3000
        });
        this.isLoadingMarcarLeido = false;
      }
    );
  }



}
