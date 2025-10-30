// Angular Core
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';

// Librerías externas - PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Librerías externas - PrimeNG
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Historial
import { HistorialService } from '../../../../servicios/solicitud/historial/historial.service';

@Component({
  selector: 'app-historial-modal',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './historial-modal.component.html',
  styleUrl: './historial-modal.component.scss'
})
export class HistorialModalComponent {

  @Input() visible = false;
  @Input() historialEstados: any[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() ticket: string = '';
  @ViewChild('scrollContenedor') scrollContenedor!: ElementRef;
  constructor(
    public srvHistorial: HistorialService
  ) { }

  ngOnChanges() {
    if (this.visible) {
      setTimeout(() => {
        if (this.scrollContenedor?.nativeElement) {
          const el = this.scrollContenedor.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
      }, 100);
    }
  }

  // ────────────────────────────────
  // SECCIÓN DE EXPORTACIÓN DE HISTORIAL EN PDF
  // Generación del PDF con logos, encabezado y tabla de historial
  // ────────────────────────────────

  getImageBase64(url: string): Promise<{ base64: string, width: number, height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve({ base64: dataURL, width: img.width, height: img.height });
      };
      img.onerror = () => reject('Error cargando imagen');
      img.src = url;
    });
  }

  async descargarHistorialPDF() {
    const [logoIzq, logoDer] = await Promise.all([
      this.getImageBase64('/LOGO VRA-DD.png'),
      this.getImageBase64('/UNAH_Azul.png')
    ]);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const fechaStr = new Date().toLocaleString('es-HN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const scale = 0.05;
    const scaleder = 0.065;
    // Aplicar la misma escala a ambos logos
    const logoIzqWidth = logoIzq.width * scale;
    const logoIzqHeight = logoIzq.height * scale;

    const logoDerWidth = logoDer.width * scaleder;
    const logoDerHeight = logoDer.height * scaleder;
    // Dibujar encabezado solo una vez
    const drawHeader = () => {
      // Logo izquierdo
      doc.addImage(logoDer.base64, 'PNG', 15, 5, logoDerWidth, logoDerHeight);

      // Logo derecho
      doc.addImage(logoIzq.base64, 'PNG', pageWidth - logoIzqWidth - 9, 2, logoIzqWidth, logoIzqHeight);

      // Texto central
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text('UNIVERSIDAD NACIONAL AUTÓNOMA DE HONDURAS', pageWidth / 2, 33, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Historial de Estados de la Solicitud', 14, 43);

      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${fechaStr}`, 14, 49);
    };


    drawHeader();

    autoTable(doc, {
      startY: 53,
      head: [['Etapa', 'Estado', 'Fecha', 'Responsable', 'Observación']],
      body: this.historialEstados.map(item => [
        item.etapa,
        item.estadoSolicitud,
        item.fechaFormateada,
        item.usuarioModifico,
        item.observacion || 'Sin observación'
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: 255,
        halign: 'center'
      },
      bodyStyles: { fontSize: 10, valign: 'top' },
      styles: { cellPadding: 3 },
      columnStyles: {
        1: { cellWidth: 45 },
        3: { cellWidth: 60, halign: 'left' }
      },
      didDrawPage: () => {
        // aquí ya no se escribe el número de página
      }
    });

    // ✅ Total de páginas real
    const totalPages = doc.getNumberOfPages();

    // ✅ Escribir paginación en cada página
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save('historial-estados.pdf');
  }

}
