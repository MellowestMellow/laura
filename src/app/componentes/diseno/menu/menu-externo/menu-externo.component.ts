import { isPlatformBrowser } from "@angular/common";
import { Component, OnInit, PLATFORM_ID, ChangeDetectorRef, inject, HostListener } from "@angular/core";
import { PrimeNGImports } from "../../../../../primeng.imports";
import { AngularImports } from "../../../../../angular.imports";
import { interval, Subscription } from 'rxjs';
import { CalendarioService } from '../../../../servicios/plan-operativo/calendario/calendario.service'; // <-- importa tu servicio real

@Component({
  selector: 'app-menu-externo',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './menu-externo.component.html',
  styleUrl: './menu-externo.component.scss'
})
export class MenuExternoComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private timerSubscription?: Subscription;

  // Variables enlazadas al HTML
  requestInfo: any = {};
  stages: any[] = [];
  currentStage: any = {};
  overallProgress = 0;
  timeRemaining = { days: 0, hours: 0, minutes: 0 };
  totalEstimatedMonths = 0;
  elapsedDays = 0;

  // Datos para charts
  doughnutData: any;
  doughnutOptions: any;
  barData: any;
  barOptions: any;
  lineData: any;
  lineOptions: any;

  loading: boolean = true;

  constructor(private CalendarioService: CalendarioService) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarMetricas();
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
cargarMetricas() {
  this.loading = true; // 🔹 activar spinner

this.CalendarioService.getMetricasUsuarioExterno().subscribe({
  next: (data) => {
    // Datos generales
    this.requestInfo = data.requestInfo;
    this.stages = data.stages ?? []; // si es undefined, asigna un array vacío

    // Última etapa solo si hay elementos
    this.currentStage = this.stages.length > 0 ? this.stages[this.stages.length - 1] : null;

    this.overallProgress = data.overallProgress;
    this.totalEstimatedMonths = data.totalEstimatedMonths;
    this.elapsedDays = data.elapsedDays;

    // Tiempo transcurrido
    this.timeRemaining = { 
      days: data.elapsedDays ?? 0, 
      hours: 0, 
      minutes: 0 
    };

    // Gráficos (última solicitud)
    this.doughnutData = data.doughnutData ?? {};
    this.barData = data.barData ?? {};

    // Gráfico de línea (todas las solicitudes)
    this.lineData = data.lineData ?? {};

    // Opciones de gráficos
    this.doughnutOptions = { plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false };
    this.barOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } };
    this.lineOptions = { responsive: true, maintainAspectRatio: false };

    this.loading = false; // desactivar spinner
  },
  error: (err) => {
    console.error('Error cargando métricas', err);
    this.loading = false;
  }
});
}


private groupBy(array: any[], key: string) {
  return array.reduce((acc, obj) => {
    const valor = obj[key] || 'Desconocido';
    acc[valor] = acc[valor] || [];
    acc[valor].push(obj);
    return acc;
  }, {} as { [key: string]: any[] });
}


  startTimer() {
    this.timerSubscription = interval(60000).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  // Funciones usadas en HTML
  getElapsedMonths(): number {
    return Math.floor(this.elapsedDays / 30);
  }

  getCurrentStageProgress(): number {
    return this.overallProgress;
  }

  getStageClass(status: string) {
    return {
      'completed': status === 'completed',
      'current': status === 'current',
      'pending': status === 'pending'
    };
  }

  getStageIcon(status: string) {
    if (status === 'completed') return 'pi-check-circle';
    if (status === 'current') return 'pi-clock';
    return 'pi-circle';
  }

getPriorityClass() {
  const priority = this.requestInfo?.priority?.toLowerCase();
  if (priority === 'alta') return 'priority-high';
  if (priority === 'media') return 'priority-medium';
  if (priority === 'baja') return 'priority-low';
  return '';
}

}
