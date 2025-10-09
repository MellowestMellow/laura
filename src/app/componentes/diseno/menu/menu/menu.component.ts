import { isPlatformBrowser } from "@angular/common"
import { Component, OnInit, PLATFORM_ID, ChangeDetectorRef, inject, EventEmitter, Output } from "@angular/core"
import { PrimeNGImports } from "../../../../../primeng.imports"
import { AngularImports } from "../../../../../angular.imports"
import { CalendarioService } from "../../../../servicios/plan-operativo/calendario/calendario.service";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // Necesario para descargar el archivo en el navegador
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';

interface Solicitud {
  idUnidadAcademica: number;
  nombreUnidadAcademica: string;
  idSolicitud: number;
  ticket: string;
  tipoSolicitud: string;
  estadoSolicitud: string;
  fechaRegistro: string;
  idEtapa: number;
  etapa: string;
  ultimaFechaModificacion: string | null;
}

interface UnidadMetricas {
  idUnidad: number;
  nombre: string;
  total: number;
  solicitudes: Solicitud[];
  porTipo: Record<string, number>;
  porEstado: Record<string, number>;
  chartData?: any;
}

interface RequestStatusMetrics {
  registered: number;
  denied: number;
  dictated: number;
}

interface RequestTypeMetrics {
  strategic: number;
  curricular: number;
  administrative: number;
}

interface MonthlyMetric {
  month: string;
  registered: number;
  completed: number;
  avgResponseDays: number;
  denied: number;
}

interface CurricularSubtypeCount {
  name: string;
  count: number;
}

interface CurricularPlanTime {
  name: string;
  avgDays: number;
}

interface CombinedStrategicAdministrativeData {
  strategicAvgDays: number;
  administrativeAvgDays: number;
  strategicActive: number;
  strategicCompleted: number;
  administrativeActive: number;
  administrativeCompleted: number;
}

@Component({
  selector: "app-menu",
  imports: [PrimeNGImports, AngularImports],
  templateUrl: "./menu.component.html",
  styleUrl: "./menu.component.scss",
})

export class MenuComponent implements OnInit {

  @Output() loadingCompleted = new EventEmitter<boolean>();

  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private CalendarioService = inject(CalendarioService);
    private AuthService= inject (AuthService);

  requestStatus!: RequestStatusMetrics;
  requestTypes!: RequestTypeMetrics;

  combinedStrategicAdministrativeData!: CombinedStrategicAdministrativeData;

  curricularSubtypeCounts: CurricularSubtypeCount[] = [];
  curricularPlanTimes: CurricularPlanTime[] = [];

  monthlyMetrics: MonthlyMetric[] = [];

  requestTypesChartOptions: any;
  requestStatusChartOptions: any;
  requestStatusChartData: any;
  requestTypesChartData: any;
  userRequestData: any;
  userRequestChartData: any;
  userRequestChartOptions: any;
  monthlyMetricsChartData: any;
  monthlyMetricsChartOptions: any;
  curricularPlanTimeChartData: any;
  curricularPlanTimeChartOptions: any;
  curricularSubtypeDistributionChartData: any;
  curricularSubtypeDistributionChartOptions: any;
  combinedStrategicAdministrativeResponseTimeChartData: any;
  combinedStrategicAdministrativeResponseTimeChartOptions: any;
  combinedStrategicAdministrativeDistributionChartData: any;
  combinedStrategicAdministrativeDistributionChartOptions: any;

  barChartData: any = null;
  barChartOptions: any = null;

  totalCompletedRequests: number = 0;
  generalAvgResponseTime: number = 0;

  trimestreActual!: number;
  trimestreSeleccionado: string = 'anual';
metricasPorUnidad: any = {};    // Totales por unidad, tipo y estado
resumenGeneral: any = {};       // Totales globales
datosGraficoUnidad: any[] = []; // Para gráfico de barras
datosGraficoTipo: any[] = [];   // Para gráfico de dona
rol: number[] = [];
rolvra: boolean = false;

  trimestresDisponibles = [
    { label: 'Trimestre 1', value: 1 },
    { label: 'Trimestre 2', value: 2 },
    { label: 'Trimestre 3', value: 3 },
    { label: 'Trimestre 4', value: 4 },
    { label: 'Anual', value: 'anual' } // 👈 Este es string
  ];

  anioSeleccionado: number = new Date().getFullYear();

  esAnual = true;
  loadingtable: boolean = false;

  aniosDisponibles: number[] = [];
  aniosOptions: { label: string; value: number }[] = [];

  constructor(
    private router: Router

  ) { }
  irA(ruta: string) {
  this.router.navigate([ruta]);
}

ngOnInit() {
  const mesActual = new Date().getMonth() + 1;
  this.trimestreActual = Math.ceil(mesActual / 3);

  this.trimestresDisponibles = [
    ...Array(this.trimestreActual).fill(0).map((_, i) => ({
      label: `Trimestre ${i + 1}`,
      value: String(i + 1)
    })),
    { label: 'Todo el año', value: 'anual' }
  ];

  const anioActual = new Date().getFullYear();
  this.anioSeleccionado = anioActual;

  // Cargar últimos 6 años
  this.aniosDisponibles = Array.from({ length: 6 }, (_, i) => anioActual - i);

  // Crear opciones para p-select años
  this.aniosOptions = this.aniosDisponibles.map(anio => ({
    label: anio.toString(),
    value: anio
  }));

const roles = this.AuthService.getRolesFromToken();
  this.rol = Array.isArray(roles) ? roles : [];

  // ✅ Activa el flag si el usuario tiene rol 3
  if (this.rol.includes(3)) {
  this.rolvra = true;
  this.cargarMetricasPorUnidad();
} else if ([4, 5, 6, 7, 8, 9, 14, 15, 16].some(r => this.rol.includes(r))) {
  if (isPlatformBrowser(this.platformId)) {
    this.loadMetrics();
  }
}
}
async descargarDatos() { 
  const anioSeleccionado = this.anioSeleccionado || new Date().getFullYear();
  const anioActual = new Date().getFullYear();
  let trimestre: number | undefined = undefined;

  if (anioSeleccionado === anioActual && this.trimestreSeleccionado !== 'anual') {
    trimestre = Number(this.trimestreSeleccionado);
  }

  console.log('Descargar métricas con parámetros:', {
    anio: trimestre ? undefined : anioSeleccionado,
    trimestre
  });

  try {
    const metricas: any[][] = await firstValueFrom(
      trimestre
        ? this.CalendarioService.getMetricasParaDescarga(undefined, trimestre)
        : this.CalendarioService.getMetricasParaDescarga(anioSeleccionado, undefined)
    );

    const workbook = new ExcelJS.Workbook();

    // Nombres de hojas
    const nombresHojas: Record<string, string> = {
      RequestStatus: 'Estado de Solicitudes',
      RequestTypes: 'Tipos de Solicitud',
      MonthlyMetrics: 'Métricas Mensuales',
      CurricularSubtypeCounts: 'Subtipos Curriculares',
      CurricularPlanTimes: 'Tiempos Plan Curricular',
      CombinedStrategicAdministrativeData: 'Datos Estrategicos-Administrativos'
    };

    // Traducción de nombres de columnas
    const nombresColumnas: Record<string, string> = {
      registered: 'Registradas',
      denied: 'Denegadas',
      completed: 'Completadas',
      avgResponseDays: 'Prom. Días Respuesta',
      strategic: 'Estratégicas',
      curricular: 'Curriculares',
      administrative: 'Administrativas',
      month: 'Mes',
      name: 'Nombre',
      count: 'Cantidad',
      avgDays: 'Prom. Días',
      strategicAvgDays: 'Prom. Días Estratégicas',
      administrativeAvgDays: 'Prom. Días Administrativas',
      strategicActive: 'Activas Estratégicas',
      strategicCompleted: 'Completadas Estratégicas',
      administrativeActive: 'Activas Administrativas',
      administrativeCompleted: 'Completadas Administrativas'
    };

    metricas.forEach((bloque, index) => {
      if (!Array.isArray(bloque) || bloque.length === 0) return;

      const metricName = bloque[0]?.metricName;
      const nombreHoja = (nombresHojas[metricName] || `Hoja ${index + 1}`)
        .substring(0, 31) // Excel máx 31 caracteres
        .replace(/[\\\/\?\*\[\]]/g, '-'); // quitar caracteres inválidos

      const worksheet = workbook.addWorksheet(nombreHoja);

      // Generar encabezados traducidos, sin metricName
      const headers = Object.keys(bloque[0] || {}).filter(h => h && h !== 'metricName');
      const headersTraducidos = headers.map(h => nombresColumnas[h] || h);
      worksheet.addRow(headersTraducidos);

      // Agregar datos
      bloque.forEach((fila) => {
        worksheet.addRow(headers.map((h) => fila[h]));
      });

      // Ajustar ancho de columnas
      worksheet.columns.forEach((col) => {
        col.width = Math.max(12, col.header?.toString().length || 12);
      });
    });

    const periodo = trimestre
      ? `trimestre-${trimestre}_${anioActual}`
      : `anual-${anioSeleccionado}`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Estadisticas-${periodo}.xlsx`);
  } catch (error) {
    console.error('Error descargando métricas:', error);
    alert('Hubo un error al descargar las métricas. Verifica los parámetros.');
  }
} 
  onPeriodoChange() {
    const anioActual = new Date().getFullYear();

    this.esAnual = this.trimestreSeleccionado === 'anual';

    // ⚠️ Si se selecciona un año anterior, forzar modo anual
    if (this.anioSeleccionado < anioActual) {
      this.trimestreSeleccionado = 'anual';
      this.esAnual = true;
    }

    // Por defecto, si no hay año, poner año actual
    if (!this.anioSeleccionado) {
      this.anioSeleccionado = anioActual;
    }
  }
  get tieneRolGeneral(): boolean {
  return this.rol.some(r => (r >= 4 && r <= 9) || (r >= 14 && r <= 16));
}

// Colores consistentes con el gráfico
tipoColores = {
  'Diseño Curricular': { bg: '#229bb95e', text: '#007d9cff' },
  'Rediseño Curricular': { bg: '#f5da0b60', text: '#9d8b00ff' },
  'Ampliación Curricular': { bg: '#10b98153', text: '#007e54ff' },
  'Actualización Integrantes Subcomisión Curricular': { bg: '#ed3a6457', text: '#9e0025ff' },
  'Otros': { bg: '#ef8b4453', text: '#cc5500ff' },
};

getTipoColor(tipoSolicitud: string, isBackground: boolean): string {
  const key = tipoSolicitud as keyof typeof this.tipoColores; // ✅ le dices a TS que es una clave válida
  const color = this.tipoColores[key] || { bg: '#e5e7eb', text: '#374151' }; // gris por defecto
  return isBackground ? color.bg : color.text;
}




private cargarMetricasPorUnidad() {
  this.loadingtable = true;

  this.CalendarioService.getMetricasSolicitudesPorUnidad().subscribe({
    next: (data: Solicitud[]) => {
      if (Array.isArray(data)) {

        const agrupado = data.reduce((acc: Record<number, UnidadMetricas>, item: Solicitud) => {
          if (!acc[item.idUnidadAcademica]) {
            acc[item.idUnidadAcademica] = {
              idUnidad: item.idUnidadAcademica,
              nombre: item.nombreUnidadAcademica,
              total: 0,
              solicitudes: [],
              porTipo: {},
              porEstado: {}
            };
          }

          const unidad = acc[item.idUnidadAcademica];

          // Buscar si ya existe esta solicitud
          const indexExistente = unidad.solicitudes.findIndex(s => s.idSolicitud === item.idSolicitud);

          if (indexExistente >= 0) {
            const solicitudExistente = unidad.solicitudes[indexExistente];

            if (
              item.idEtapa > solicitudExistente.idEtapa ||
              (item.ultimaFechaModificacion && solicitudExistente.ultimaFechaModificacion &&
                new Date(item.ultimaFechaModificacion) > new Date(solicitudExistente.ultimaFechaModificacion))
            ) {
              unidad.solicitudes[indexExistente] = item;
            }
          } else {
            unidad.solicitudes.push(item);
          }

          return acc;
        }, {} as Record<number, UnidadMetricas>);

        // Recalcular métricas y preparar gráficos
        this.metricasPorUnidad = Object.values(agrupado).map(unidad => {
          const porTipo: Record<string, number> = {};
          const porEstado: Record<string, number> = {};

          unidad.solicitudes.forEach(s => {
            porTipo[s.tipoSolicitud] = (porTipo[s.tipoSolicitud] || 0) + 1;
            porEstado[s.estadoSolicitud] = (porEstado[s.estadoSolicitud] || 0) + 1;
          });

          const labels = Object.keys(porTipo);
          const data = Object.values(porTipo);

          // Colores distintos para cada tipo de solicitud
          const colors = ['#229bb9', '#f59e0b', '#10b981',  '#ef4444', ];

          return {
            ...unidad,
            total: unidad.solicitudes.length,
            porTipo,
            porEstado,
            chartData: {
              labels,
              datasets: [
                {
                  data,
                  backgroundColor: labels.map((_, i) => colors[i % colors.length])
                }
              ]
            },
            chartOptions: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { font: { size: 12 } }
                }
              }
            }
          };
        });

        console.log('Métricas por unidad:', this.metricasPorUnidad);
        this.cdr.detectChanges();
      }

      this.loadingtable = false;
    },
    error: (err) => {
      console.error('Error al cargar métricas por unidad:', err);
      this.loadingtable = false;
    }
  });
}

trackByUnidadId(index: number, unidad: any) {
  return unidad.idUnidad;
}

private loadMetrics() {
  this.loadingtable = true; // 👉 Mostrar spinner

  this.CalendarioService.getMetricasGenerales().subscribe({
    next: (data) => {
      if (Array.isArray(data)) {
        // 1️⃣ Request Status
        const requestStatusData = data[0]?.[0] || { registered: 0, denied: 0, completed: 0 };
        this.requestStatus = {
          registered: requestStatusData.registered || 0,
          denied: requestStatusData.denied || 0,
          dictated: requestStatusData.completed || 0 // 🔹 Mapeo completado a dictated
        };

        // 2️⃣ Request Types
        this.requestTypes = data[1]?.[0] || { strategic: 0, curricular: 0, administrative: 0 };

        // 3️⃣ Monthly Metrics
        this.monthlyMetrics = (data[2] || [])
          .map((m: any) => ({
            month: m.month,
            monthNumber: new Date(`${m.month} 1, 2000`).getMonth() + 1, // Orden por número de mes
            registered: m.registered,
            completed: m.completed,
            avgResponseDays: m.avgResponseDays,
            denied: m.denied,
          }))
         .sort((a: any, b: any) => a.monthNumber - b.monthNumber);


        // 4️⃣ Curricular Subtype Counts
        this.curricularSubtypeCounts = (data[3] || []).map((c: any) => ({
          name: c.name,
          count: c.count,
        }));

        // 5️⃣ Curricular Plan Times
        this.curricularPlanTimes = (data[4] || []).map((c: any) => ({
          name: c.name,
          avgDays: c.avgDays,
        }));

        // 6️⃣ Combined Strategic/Administrative Data
        this.combinedStrategicAdministrativeData = data[5]?.[0] || {
          strategicAvgDays: 0,
          administrativeAvgDays: 0,
          strategicActive: 0,
          strategicCompleted: 0,
          administrativeActive: 0,
          administrativeCompleted: 0,
        };

        // Inicializar todos los gráficos
        this.initializeCharts();

        // Calcular métricas resumidas
        this.calculateSummaryMetrics();

        this.cdr.detectChanges();
      }

      this.loadingtable = false; // 👉 Ocultar spinner al terminar
      this.loadingCompleted.emit(true);
    },
    error: (err) => {
      console.error("Error al cargar métricas:", err);
      this.loadingtable = false; // 👉 Ocultar spinner también en error
      this.loadingCompleted.emit(true);
    }
  });
}
  private initializeCharts() {
    this.combinedStrategicAdministrativeResponseTimeChartData = {
      labels: ['Estratégicas', 'Administrativas'],
      datasets: [
        {
          label: 'Tiempo Promedio (días)',
          backgroundColor: ['#42A5F5', '#FFA726'],
          data: [
            this.combinedStrategicAdministrativeData.strategicAvgDays,
            this.combinedStrategicAdministrativeData.administrativeAvgDays
          ]
        }
      ]
    };

    this.combinedStrategicAdministrativeResponseTimeChartOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    };

    this.combinedStrategicAdministrativeDistributionChartData = {
      labels: ['Estratégicas Completadas', 'Administrativas Completadas'],
      datasets: [{
        borderRadius: 8, // 🔹 Bordes redondeados
        spacing: 3,
        data: [
          this.combinedStrategicAdministrativeData.strategicCompleted,
          this.combinedStrategicAdministrativeData.administrativeCompleted
        ],
        label: 'Cantidad',
        backgroundColor: ['#0095f1ff', '#52dfffff']
      }]
    };

    this.combinedStrategicAdministrativeDistributionChartOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    };

    this.curricularPlanTimeChartData = {
      labels: this.curricularPlanTimes.map(p => p.name),
      datasets: [{
        label: 'Tiempo Promedio (días)',
        backgroundColor: '#66BB6A',
        data: this.curricularPlanTimes.map(p => p.avgDays)
      }]
    };

    this.curricularPlanTimeChartOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    };

    this.curricularSubtypeDistributionChartData = {
      labels: this.curricularSubtypeCounts.map(c => c.name),
      datasets: [{
        borderRadius: 8, // 🔹 Bordes redondeados
        spacing: 3,
        data: this.curricularSubtypeCounts.map(c => c.count),
        backgroundColor: ['#127fecff', '#fc4f24ff', '#f0cd08ff', '#97f52bff', '#ff4343ff'],
        label: 'Cantidad',
      }]
    };

    this.curricularSubtypeDistributionChartOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    };

    this.monthlyMetricsChartData = {
      labels: this.monthlyMetrics.map(m => m.month),
      datasets: [
        {
          label: 'Registradas',
          backgroundColor: '#0385c1ff', // Azul más intenso
          data: this.monthlyMetrics.map(m => m.registered),
          borderRadius: 8, // 🔹 Bordes redondeados
          spacing: 3,
        },
        {
          label: 'Completadas',
          backgroundColor: '#00dc67ff', // Verde más profundo
          data: this.monthlyMetrics.map(m => m.completed),
          borderRadius: 8, // 🔹 Bordes redondeados
          spacing: 3,
        },
        {
          label: 'Denegadas',
          backgroundColor: '#f7121dff', // Rojo más fuerte
          data: this.monthlyMetrics.map(m => m.denied),
          borderRadius: 8, // 🔹 Bordes redondeados
          spacing: 3,
        }
      ]

    };

    this.monthlyMetricsChartOptions = {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true } }
    };

    this.requestTypesChartData = {
      labels: ['Estratégicas', 'Curriculares', 'Administrativas'],
      datasets: [{
        label: 'Cantidad',
        backgroundColor: ['#0095f1ff', '#03496aff', '#52dfffff'],
        borderRadius: 8, // 🔹 Bordes redondeados
        spacing: 3,
        data: [
          this.requestTypes.strategic || 0,
          this.requestTypes.curricular || 0,
          this.requestTypes.administrative || 0
        ]
      }]
    };

    this.requestTypesChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    this.requestStatusChartData = {
      labels: ['Registradas', 'Denegadas', 'Dictaminadas'],
      datasets: [{
        label: 'Cantidad',
        borderRadius: 8, // 🔹 Bordes redondeados
        spacing: 3,
        backgroundColor: ['#00d2e1ff', '#a80000ff', '#13bb16ff'],
        data: [
          this.requestStatus.registered || 0,
          this.requestStatus.denied || 0,
          this.requestStatus.dictated || 0
        ]
      }]
    };

    this.requestStatusChartOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    };
  }

private calculateSummaryMetrics() {
  this.totalCompletedRequests = this.monthlyMetrics.reduce(
    (sum, m) => sum + Number(m.completed || 0),
    0
  );

  const totalAvgDays = this.monthlyMetrics.reduce(
    (sum, m) => sum + Number(m.avgResponseDays || 0),
    0
  );

  this.generalAvgResponseTime =
    this.monthlyMetrics.length > 0 ? totalAvgDays / this.monthlyMetrics.length : 0;
}
  getTrafficLightClass(count: number | undefined, type: "registered" | "denied" | "dictated"): string {
    const safeCount = count ?? 0;
    if (type === "dictated") return "status-low";
    else if (type === "denied") return "status-high";
    else if (type === "registered") return "status-medium";
    return "";
  }
}
