// Angular Core
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { BitacoraService } from '../../../../servicios/seguridad/acceso/bitacora/bitacora.service';

// Servicios - Reportes
import { ReporteService } from '../../../../servicios/reporte/reporte.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';

@Component({
  selector: 'app-bitacora',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './bitacora.component.html',
  styleUrl: './bitacora.component.scss'
})

export class BitacoraComponent {
  @ViewChild('dt') dt: any;
  @Output() loadingCompleted = new EventEmitter<boolean>();

  searchValue: string | undefined;

  bitacora: any[] = [];

  loadingtable: boolean = false;

  constructor(
    private BitacoraService: BitacoraService,
    private messageService: MessageService,
    private srvReporte: ReporteService,
    private router: Router,
    private layoutService: LayoutService
  ) {

  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.loadingtable = true;
    this.cargarBitacora();
    this.layoutService.setHeader('Bitacora');
  }

  columnasBase = [
    { campo: 'UsuarioNombreCompleto', nombre: 'Usuario' },
    { campo: 'NombreObjeto', nombre: 'Pantalla' },
    { campo: 'descripcion', nombre: 'Descripcion' },
    { campo: 'fechaRegistro', nombre: 'Fecha Registro' },
    { campo: 'accion', nombre: 'Acción' },
  ];

  regresarPanel() {
    this.router.navigate(['/panel/seguridad']);
  }

  exportarExcel() {
    this.srvReporte.exportToExcelConEtapasFlexible(
      this.dt,
      this.columnasBase,
      'Reprte-Bitacora-' + this.srvReporte.getFecha(),
    );
  }

  exportarPDF() {
    this.srvReporte.exportToPDFConEtapasFlexibleFormatted(
      this.dt,
      this.columnasBase,
      'Reprte-Bitacora-' + this.srvReporte.getFecha(),
      'Reporte de Bitácora'
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

  showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Operación Fallida',
      detail: message,
      life: 3000
    });
  }

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────

  cargarBitacora(): void {
    this.loadingtable = true;  // Mostrar un estado de carga al inicio
    this.BitacoraService.getBitacora().subscribe(
      (response: any) => {
        this.bitacora = response.map((bitacora: any, index: number) => ({
          numero: index + 1, // Agregar un número consecutivo manualmente
          ...bitacora,
          fechaRegistro: new Date(bitacora.fechaRegistro), // Asegúrate de convertir la fecha
        }));
        this.loadingtable = false; // Datos cargados con éxito
        this.loadingCompleted.emit(true);
      },
      (error) => {
        this.loadingtable = false;  // Detener el estado de carga
        this.showErrorMessage(error.error.mensaje);  // Mostrar mensaje de error (puedes mejorar la visualización)
        this.loadingCompleted.emit(true);
      }
    );
  }

}
