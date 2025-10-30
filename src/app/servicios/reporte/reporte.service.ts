// Angular Core
import { Injectable } from '@angular/core';

// Librerías externas - Excel
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

// Librerías externas - PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})

export class ReporteService {
  constructor() { }
  
  getFecha():string{
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
    const day = String(hoy.getDate()).padStart(2, '0');

    const fecha = `${year}-${month}-${day}`;

    return fecha;
  }

  exportToExcelConEtapasFlexible(dt: any, columnasBase: { campo: string; nombre: string }[], fileName: string = 'reporte') {
    const data = dt.filteredValue ?? dt.value;
    const etapasUnicas = new Map<number, string>();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Solicitudes');

    data.forEach((item: any) => {
      item.estadosSolicitud?.forEach((estado: any) => {
        if (estado.idEtapa != null && !etapasUnicas.has(estado.idEtapa)) {
          etapasUnicas.set(estado.idEtapa, estado.etapa);
        }
      });
    });

    const etapas = Array.from(etapasUnicas.entries()).sort(
      (a, b) => a[0] - b[0]
    );

    const mostrarEstadoGeneral = data.some((item: any) => {
      const sinEtapas = !item.estadosSolicitud || item.estadosSolicitud.every((e: any) => e.idEtapa == null);
      return sinEtapas && !!(item.estadoSolicitud || item.estadosSolicitud?.[0]?.estadoSolicitud);
    });

    const headerRow = [
      ...columnasBase.map((c) => c.nombre),
      ...(mostrarEstadoGeneral ? ['Estado General'] : []),
      ...etapas.map((e) => e[1]), // Nombres de etapas
    ];
    worksheet.addRow(headerRow);

    data.forEach((item: any) => {
      const base = columnasBase.map((col) => {
        if (col.campo === 'fechaRegistro') {
          return new Date(item[col.campo]).toLocaleDateString('es-HN');
        }
        return item[col.campo];
      });

      const filaEtapas = etapas.map(([id]) => {
        const estado = item.estadosSolicitud?.find(
          (e: any) => e.idEtapa === id
        );
        return estado ? estado.estadoSolicitud : '';
      });

      const fila = [
        ...base,
        ...(mostrarEstadoGeneral
          ? [
            typeof item.estadoSolicitud === 'object'
              ? item.estadoSolicitud.estadoSolicitud ?? ''
              : item.estadoSolicitud ?? '',
          ]
          : []),
        ...filaEtapas,
      ];

      worksheet.addRow(fila);
    });

    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, `${fileName}.xlsx`);
    });
  }

  async exportToPDFConEtapasFlexibleFormatted(dt: any, columnasBase: { campo: string; nombre: string }[], fileName: string = 'reporte', nombreReporte: string = '') {
    const data = dt.filteredValue ?? dt.value;
    const etapasUnicas = new Map<number, string>();
   

    data.forEach((item: any) => {
      item.estadosSolicitud?.forEach((estado: any) => {
        if (estado.idEtapa != null && !etapasUnicas.has(estado.idEtapa)) {
          etapasUnicas.set(estado.idEtapa, estado.etapa);
        }
      });
    });

    const etapas = Array.from(etapasUnicas.entries()).sort(
      (a, b) => a[0] - b[0]
    );

    const mostrarEstadoGeneral = data.some((item: any) => {
      const sinEtapas = !item.estadosSolicitud || item.estadosSolicitud.every((e: any) => e.idEtapa == null);
      return sinEtapas && !!(item.estadoSolicitud || item.estadosSolicitud?.[0]?.estadoSolicitud);
    });

    const totalColumnas =  columnasBase.length + etapas.length + (mostrarEstadoGeneral ? 1 : 0);
    const orientacion = totalColumnas > 5 ? 'landscape' : 'portrait';
    const doc = new jsPDF({ orientation: orientacion });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    
    const headers = [
      ...columnasBase.map((c) => c.nombre),
      ...(mostrarEstadoGeneral ? ['Estado'] : []),
      ...etapas.map((e) => e[1]),
    ];

    const body = data.map((item: any) => {
      const base = columnasBase.map((col) => {
        const valor = item[col.campo];

        if (!valor) return 'Sin información';

        if (col.campo.toLowerCase().includes('fecha')) {
          // Si ya viene en formato largo legible, lo dejamos tal cual
          const yaFormateada = /^[0-9]{2} de \w+ de [0-9]{4}/i.test(valor);
          if (yaFormateada) return valor;

          const fecha = new Date(valor);
          if (isNaN(fecha.getTime())) return 'Formato inválido';

          return fecha.toLocaleString('es-HN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
        }

        return valor;
      });

      const filaEtapas = etapas.map(([id]) => {
        const estado = item.estadosSolicitud?.find(
          (e: any) => e.idEtapa !== null && e.idEtapa === id
        );
        return estado ? estado.estadoSolicitud : 'N/A';
      });

      const estadoGeneralCalculado = (() => {
        if (!item.estadosSolicitud || item.estadosSolicitud.length === 0) {
          return item.estadoSolicitud ?? '';
        }

        if (item.estadosSolicitud.every((e: any) => e.idEtapa == null)) {
          return (
            item.estadosSolicitud[0]?.estadoSolicitud ??
            item.estadoSolicitud ??
            ''
          );
        }

        return 'N/A'; // si tiene etapas válidas, no mostramos estado general
      })();

      const fila = [
        ...base,
        ...(mostrarEstadoGeneral ? [estadoGeneralCalculado] : []),
        ...filaEtapas,
      ];

      return fila;
    });

    const [logoIzq, logoDer] = await Promise.all([
      this.getImageBase64('/LOGO VRA-DD.png'),
      this.getImageBase64('/UNAH_Azul.png'),
    ]);

    const fechaStr = new Date().toLocaleString('es-HN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const scale = 0.05;
    const scaleder = 0.065;

    const logoIzqWidth = logoIzq.width * scale;
    const logoIzqHeight = logoIzq.height * scale;

    const logoDerWidth = logoDer.width * scaleder;
    const logoDerHeight = logoDer.height * scaleder;

    const drawHeader = () => {
      doc.addImage(logoDer.base64, 'PNG', 15, 5, logoDerWidth, logoDerHeight);
      doc.addImage(
        logoIzq.base64,
        'PNG',
        pageWidth - logoIzqWidth - 9,
        2,
        logoIzqWidth,
        logoIzqHeight
      );

      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text('UNIVERSIDAD NACIONAL AUTÓNOMA DE HONDURAS', pageWidth / 2, 33, {
        align: 'center',
      });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold'); // Negrita
      doc.setTextColor(0);
      doc.text(nombreReporte, pageWidth / 2, 43, {
        align: 'center',
      }); // Centrado

      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${fechaStr}`, 14, 49);
    };

    drawHeader();

    autoTable(doc, {
      startY: 53,
      head: [headers],
      body,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: 255,
        halign: 'center',
      },
      bodyStyles: { fontSize: 9, valign: 'top' },
      styles: { cellPadding: 3 },
      didDrawPage: function () {
  
      },
    });

    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
        align: 'center',
      });
    }

    doc.save(`${fileName}.pdf`);
  }

  getImageBase64(
    url: string
  ): Promise<{ base64: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve({
            base64: canvas.toDataURL('image/png'),
            width: img.width,
            height: img.height,
          });
        } else {
          reject('Error al cargar imagen');
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  }
  
}
