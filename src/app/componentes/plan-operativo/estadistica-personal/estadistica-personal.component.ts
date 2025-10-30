import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from "@angular/core";
import { CalendarioService } from "../../../servicios/plan-operativo/calendario/calendario.service";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { firstValueFrom } from 'rxjs';
import { PrimeNGImports } from "../../../../primeng.imports";
import { AngularImports } from "../../../../angular.imports";
import { AsignacionService } from '../../../servicios/solicitud/asignacion/asignacion.service';
import { AuthService } from '../../../servicios/seguridad/acceso/auth/auth.service'; // ruta según tu proyecto
@Component({
  selector: 'app-estadistica-personal',
  templateUrl: './estadistica-personal.component.html',
  styleUrl: './estadistica-personal.component.scss',
  standalone: true,
  imports: [CommonModule, PrimeNGImports, AngularImports]
})
export class EstadisticaPersonalComponent implements OnInit {

  private AsignacionService = inject(AsignacionService)
  private calendarioService = inject(CalendarioService);
  private AuthService = inject(AuthService);
  mostrarDropdown = false; // Controla la visibilidad
  rolesPermitidos = [1, 2, 3, 4];
  loading: boolean = false;
  idUsuario: number = 0;
  categoriaSeleccionada: string = '';
  categoriasUnicas: string[] = [];
  selectedItem: any;
  filteredItems: any[] = [];
  usuarios: any[] = [];
  nombrePersona: string = '';
  trimestre: number = 0;
  anio: number = 0;
  // ✅ Variables para cada recordset
  metricasPorTipoCategoria: any[] = [];
  metricasPorEtapa: any[] = [];
  tiemposPorSolicitud: any[] = [];
  activeTabValue = 0;
  first = 0;
  rows = 5;
  // 📊 Gráficos
  barChartTipoCategoria: any;
  barChartEtapas: any;
  lineChartTiempo: any;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2, // ✅ Relación ancho:alto (2:1)
    plugins: {
      legend: { position: 'top' },
      title: { display: true }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 30
        },
        grid: {
          display: false
        }
      }
    },
    // ✅ Configuración de layout para mejor espaciado
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10
      }
    }
  };

  paginaTiempo: number = 0;
  elementosPorPagina: number = 5;
  paginacion: any;

  constructor() { }

  ngOnInit(): void {
    this.obtenerMetricas();
    this.cargarUsuarios();
      this.obtenerRolUsuario();
    if (this.metricasPorTipoCategoria?.length) {
      this.categoriasUnicas = [...new Set(this.metricasPorTipoCategoria.map(m => m.categoriaTipoSolicitud))];
      this.categoriaSeleccionada = this.categoriasUnicas[0];
    }
  }
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }


obtenerRolUsuario() {
  const roles = this.AuthService.getRolesFromToken(); // ya devuelve array o null

  if (Array.isArray(roles)) {
    this.mostrarDropdown = roles.some(r => this.rolesPermitidos.includes(r));
  } else {
    this.mostrarDropdown = false;
  }
}


async obtenerMetricas() {
  this.loading = true;

  try {
    let data: { recordsets?: any[][] };

    if (this.idUsuario === 0 || this.idUsuario === undefined) {
      // Llamada sin enviar idUsuario, backend usa id del token
      data = await firstValueFrom(this.calendarioService.getMetricaUsuarioToken());
    } else {
      // Llamada enviando el idUsuario seleccionado desde frontend
      data = await firstValueFrom(
        this.calendarioService.getMetricaUsuarioInterno(Number(this.idUsuario))
      );
    }

    // ========================
    // 📌 Guardar datasets
    // ========================
    this.metricasPorTipoCategoria = data?.recordsets?.[0] || [];
    this.metricasPorEtapa = data?.recordsets?.[1] || [];
    this.tiemposPorSolicitud = data?.recordsets?.[2] || [];

    // ========================
    // 📌 Info de la persona
    // ========================
    if (data?.recordsets?.[3]?.[0]?.nombreCompleto) {
      this.nombrePersona = data.recordsets[3][0].nombreCompleto;
      this.trimestre = data.recordsets[1]?.[0]?.trimestre;
      this.anio = data.recordsets[0]?.[0]?.anio;
    }

    // ========================
    // 📌 Categorías únicas
    // ========================
    this.categoriasUnicas = [
      ...new Set(this.metricasPorTipoCategoria.map(item => item.categoriaTipoSolicitud))
    ];

    if (this.categoriasUnicas.length > 0) {
      this.categoriaSeleccionada = this.categoriasUnicas[0];
    }

    // ========================
    // 📊 Generar Gráficos
    // ========================
    this.generarGraficos();

  } catch (error) {
    console.error('Error al cargar métricas:', error);
  } finally {
    this.loading = false;
  }
}



  // Carga usuarios, filtrando duplicados por idUsuario
  cargarUsuarios(): void {
    this.AsignacionService.getUsuarioAsignacion().subscribe(
      (response: any[]) => {
        // Filtrar duplicados, dejando solo el primer usuario por idUsuario
        const usuariosUnicos = response.filter((user, index, self) =>
          index === self.findIndex(u => u.idUsuario === user.idUsuario)
        );

        this.usuarios = usuariosUnicos.map(u => ({
          label: u.nombreCompleto, // Texto visible en el autocomplete
          value: u,                // Objeto completo para uso interno
          correo: u.correo,
          rol: u.rol,
          idUsuario: u.idUsuario
        }));
      },
      (error) => {
        console.error('Error al obtener usuarios', error);
      }
    );
  }

  // Filtra los usuarios para el autocomplete según el texto ingresado
  filterItems(event: any) {
    const query = event.query.toLowerCase();
    this.filteredItems = this.usuarios.filter(item =>
      item.label.toLowerCase().includes(query)
    );
  }

  // Evento al seleccionar un usuario del autocomplete
  onUsuarioSeleccionado(event: any) {
    const usuario = event.value; // Objeto original
    if (usuario?.idUsuario) {
      this.idUsuario = usuario.idUsuario;
      this.nombrePersona = usuario.label; // mostrar texto
      this.selectedItem = usuario; // ⚡ importante: no envolver en {label, value}
      this.obtenerMetricas();
    }
  }

  // 👇 Método auxiliar para filtrar por categoría seleccionada
  getMetricasPorCategoria(categoria: string) {
    return this.metricasPorTipoCategoria.filter(item => item.categoriaTipoSolicitud === categoria);
  }

  // ✅ Descargar Excel con 3 hojas
async descargarMetricasExcel() {
  this.loading = true;
  try {
    const workbook = new ExcelJS.Workbook();

    // 📌 Configuración de columnas por hoja: {claveObjeto, nombreColumnaExcel}
    const columnasPorHoja = [
      {
        nombreHoja: 'Por Tipo-Categoría',
        columnas: [
          { key: 'anio', title: 'Año' },
          { key: 'trimestre', title: 'Trimestre' },
          { key: 'categoriaTipoSolicitud', title: 'Categoría' },
          { key: 'tipoSolicitud', title: 'Tipo de Solicitud' },
          { key: 'totalAsignadas', title: 'Total Asignadas' },
          { key: 'nuevas', title: 'Nuevas' },
          { key: 'finalizadas', title: 'Finalizadas' },
          { key: 'enProceso', title: 'En Proceso' },
          { key: 'promedioDiasResolucion', title: 'Promedio Días Resolución' }
        ],
        data: this.metricasPorTipoCategoria
      },
      {
        nombreHoja: 'Por Etapa',
        columnas: [
          { key: 'etapa', title: 'Etapa' },
          { key: 'totalAsignadasEnEtapa', title: 'Total Asignadas' }
        ],
        data: this.metricasPorEtapa
      },
      {
        nombreHoja: 'Tiempo por Solicitud',
        columnas: [
          { key: 'ticket', title: 'Ticket' },
          { key: 'tipoSolicitud', title: 'Tipo de Solicitud' },
          { key: 'categoria', title: 'Categoría' },
          { key: 'nombreSolicitud', title: 'Nombre de Solicitud' },
          { key: 'tiempoHoras', title: 'Tiempo Transcurrido (Horas)' },
          { key: 'estadoFinal', title: 'Estado Actual' },
          { key: 'ultimaFechaEstado', title: 'Último Cambio' }
        ],
        data: this.tiemposPorSolicitud
      }
    ];

    // Recorrer cada hoja
    columnasPorHoja.forEach(sheetConfig => {
      const hoja = workbook.addWorksheet(sheetConfig.nombreHoja);

      if (sheetConfig.data.length > 0) {
        // Encabezados personalizados
        hoja.addRow(sheetConfig.columnas.map(c => c.title));
        // Filas con solo las columnas seleccionadas y en el orden definido
        sheetConfig.data.forEach(row => {
          const fila = sheetConfig.columnas.map(c => row[c.key]);
          hoja.addRow(fila);
        });
      }
    });

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `metricas_${this.nombrePersona || 'usuario'}_trimestre${this.trimestre}_${this.anio}'.xlsx`
    );

  } catch (error) {
    console.error('Error al descargar métricas:', error);
  } finally {
    this.loading = false;
  }
}





  // ✅ Generar gráficos
generarGraficos() {
  // ========================
  // 📊 Gráfico por Tipo
  // ========================
  const tipoLabels = this.metricasPorTipoCategoria.map(item => item.tipoSolicitud);
  const tipoData = this.metricasPorTipoCategoria.map(item => Number(item.totalAsignadas));

  const coloresAzules = ['#0095f1ff', '#03496aff'];

  this.barChartTipoCategoria = {
    labels: tipoLabels,
    datasets: [
      {
        label: 'Total Solicitudes Asignadas',
        data: tipoData,
        backgroundColor: tipoData.map((_, i) => coloresAzules[i % coloresAzules.length]),
        borderRadius: 8,
        spacing: 3,
      }
    ]
  };

  // ========================
  // 📊 Gráfico por Etapa
  // ========================
  const etapaLabels = this.metricasPorEtapa.map(item => item.etapa);
  const etapaData = this.metricasPorEtapa.map(item => Number(item.totalAsignadasEnEtapa));

  const coloresVerdes = ['#00c853ff', '#006d32ff'];

  this.barChartEtapas = {
    labels: etapaLabels,
    datasets: [
      {
        label: 'Total de Etapa Realizadas',
        data: etapaData,
        backgroundColor: etapaData.map((_, i) => coloresVerdes[i % coloresVerdes.length]),
        borderRadius: 8,
        spacing: 3,
      }
    ]
  };

  // ========================
  // 📈 Gráfico de Tiempo
  // ========================
  const tiempoLabels = this.tiemposPorSolicitud.map(item => item.categoria);
  const tiempoData = this.tiemposPorSolicitud.map(item => Number(item.tiempoHoras));

  this.lineChartTiempo = {
    labels: tiempoLabels,
    datasets: [
      {
        label: 'Promedio de Días',
        data: tiempoData,
        fill: false,
        tension: 0.4,
        borderColor: '#FFA726'
      }
    ]
  };
}




  // ✅ Para mostrar los registros por página
  get tiemposPaginados(): any[] {
    const inicio = this.paginaTiempo * this.elementosPorPagina;
    return this.tiemposPorSolicitud.slice(inicio, inicio + this.elementosPorPagina);
  }

  cambiarPagina(event: any) {
    this.paginaTiempo = event.page;
  }

  trackByItem(index: number, item: any): any {
    return item?.id || index;
  }

}
