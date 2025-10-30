import { SolicitudService } from './../../../../servicios/solicitud/solicitud/solicitud.service';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges } from '@angular/core';

import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';
import { MessageService } from 'primeng/api';

import { ArchivoService } from '../../../../servicios/archivo/archivo.service';

@Component({
  selector: 'app-historial-archivo',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './historial-archivo.component.html',
  styleUrl: './historial-archivo.component.scss'
})
export class HistorialArchivoComponent implements OnChanges {

  @ViewChild('filePopover') filePopover: any;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() archivos: any[] = [];
  @ViewChild('scrollContenedor') scrollContenedor!: ElementRef;

  archivosOrdenados: any[] = [];

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

  archivosPopover: { [key: string]: any[] } = {}; // Guardar archivos por keys

  // Claves de archivos que están expandidas
  expandedKeys: { [key: string]: boolean } = {};


  constructor(
    private ArchivoService: ArchivoService, private SolicitudService: SolicitudService
  ) { }

  // ────────────────────────────────
  // Sección de Gestión de Archivos
  // Métodos para cargar, descargar, seleccionar, enviar y eliminar archivos
  // Incluye manejo de estado y control de interfaz (popover, nombres, rutas)
  // ───────────────────────────────────────────────────────────

  @Input() idSolicitud!: number; // nuevo input
  @Input() ticket!: string;

  ngOnChanges() {
    if (this.visible && this.idSolicitud) {
      this.cargarHistorial(this.idSolicitud); // carga al abrir el diálogo
    }
  }

  // timeline.component.ts
  coloresTimeline: string[] = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];


  // Toggle expand/collapse
  toggleSubarchivos(key: string) {
    this.expandedKeys[key] = !this.expandedKeys[key];
  }

  // Formateo de fecha
  formatFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return fecha.toLocaleDateString('es-ES', opciones).replace(',', ' a las');
  }


  @Output() historialCargado = new EventEmitter<any[]>();
  loadingHistorial = false;

  cargarHistorial(idSolicitud: number) {
    this.loadingHistorial = true;
    this.SolicitudService.getHistorialArchivo({ idSolicitud }).subscribe(
      (data: any[]) => {
        this.archivos = data;
        this.archivosOrdenados = [...data].sort(
          (a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
        );
        this.loadingHistorial = false;
        this.historialCargado.emit(this.archivosOrdenados);
      },
      (error) => {
        console.error(error);
        this.loadingHistorial = false;
        this.historialCargado.emit([]);
      }
    );
  }

  resetHistorial() {
    this.archivos = [];
    this.archivosOrdenados = [];
    this.archivosPopover = {};
    this.expandedKeys = {};
    this.loadingHistorial = false;
    this.loadingBtnKey = null;

    // Opcional: resetear scroll al inicio
    if (this.scrollContenedor) {
      this.scrollContenedor.nativeElement.scrollTop = 0;
    }

    this.historialCargado.emit([]); // Emitir que no hay archivos
  }
  
  cargarArchivos(event: Event, nombreArchivo: string, key: string, bucket: string): void {
    this.loadingBtnKey = key;

    this.ArchivoService.getArchivos(key, bucket).subscribe(
      (response) => {
        const nombres = nombreArchivo.split(',').map((n) => n.trim());
        this.archivosPopover[key] = response.map((res: any, index: number) => {
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



}