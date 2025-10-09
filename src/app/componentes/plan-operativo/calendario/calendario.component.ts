// Angular Core
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

// Angular Forms
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

// FullCalendar
import { CalendarOptions, EventClickArg, CalendarApi, DatesSetArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { FullCalendarComponent } from '@fullcalendar/angular';

// PrimeNG
import { MessageService } from 'primeng/api';

// Shared
import { PrimeNGImports } from '../../../../primeng.imports';
import { AngularImports } from '../../../../angular.imports';

// Servicios
import { CalendarioService } from '../../../servicios/plan-operativo/calendario/calendario.service';

type EventoFC = {
  title: string;
  start: string | Date;
  end: string | Date;
  color?: string;
  extendedProps: {
    descripcion?: string;
    producto?: string;
    idUnidadAcademica?: number;
    observacion?: string | null;
    idUnidadAcademicaRegistroObs?: number | null;
    unidadAcademicaRegistroObs?: string | null;
    idTipoCalendario?: number;
    idCalendario?: number | number[];
  };
};

@Component({
  selector: 'app-calendario',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  providers: [MessageService]
})
export class CalendarioComponent implements OnInit, AfterViewInit {
  @ViewChild('calendarioTrimestralRef') calendarioTrimestralRef!: FullCalendarComponent;
  @ViewChild('calendarioSemestralRef') calendarioSemestralRef!: FullCalendarComponent;
  @ViewChild('calendarioMedicinaRef') calendarioMedicinaRef!: FullCalendarComponent;

  // Estado UI
  mostrarModal = false;
  mostrarVerDetalles = false;
  eventoSeleccionado: any = null;

  // Reglas por usuario (demo; ideal leer de auth/estado)
  idUnidadAcademicaUsuario = 1;

  // Formulario
  formRegistro!: FormGroup;
  limiteCaracteres = 500;
  limiteCaracteresProceso = 250;
  showError = false;
  loadingRegistrar = false;

  // Calendarios / Eventos
  eventosCalendario: EventoFC[] = [];   // ← aquí guardamos TODO lo que llega del backend (sin filtrar)
  eventosFiltrados: EventoFC[] = [];    // (no se usa para filtrar por mes; lo mantenemos por si necesitas listas)

  // Navegación / Tabs
  activeTab = 0; // 0: Trimestral, 1: Semestral, 2: Medicina
  tipoActual: string = 'trimestral';
  tituloMes: string = '';
  mesSeleccionado: number = new Date().getMonth();

  // IDs por tab
  private idTiposPorTab = [1, 2, 3]; // Trimestral, Semestral, Medicina
  private idUnidadesPorTab = [1, 2, 3];

  // FullCalendar options
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: false, /* {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },*/
    events: [],
    eventClick: this.verDetallesEvento.bind(this),
    datesSet: this.onDatesSet.bind(this)
  };

  // Paleta base (puedes cambiarla a tu gusto)
private PALETA_UA: string[] = [
  '#F44336', '#3F51B5', '#009688', '#FF9800', '#9C27B0',
  '#4CAF50', '#795548', '#00BCD4', '#E91E63', '#8BC34A',
  '#673AB7', '#03A9F4', '#FF5722', '#607D8B', '#9E9E9E'
];

// Cache para asignaciones UA → color (consistente entre cargas)
private colorCacheUA: Record<number, string> = {};

  // Meses para dropdown
  meses = [
    { label: 'Enero', value: 0 }, { label: 'Febrero', value: 1 }, { label: 'Marzo', value: 2 },
    { label: 'Abril', value: 3 }, { label: 'Mayo', value: 4 }, { label: 'Junio', value: 5 },
    { label: 'Julio', value: 6 }, { label: 'Agosto', value: 7 }, { label: 'Septiembre', value: 8 },
    { label: 'Octubre', value: 9 }, { label: 'Noviembre', value: 10 }, { label: 'Diciembre', value: 11 }
  ];

  constructor(
    private fb: FormBuilder,
    private srvCalendario: CalendarioService,
    private srvMessage: MessageService
  ) { }

  ngOnInit(): void {
    this.formRegistro = this.fb.group({
      idCalendario: [1, Validators.required], // Trimestral por defecto
      tipoProceso: ['', [Validators.required, Validators.maxLength(this.limiteCaracteresProceso)]],
      proceso: ['', [Validators.required, Validators.maxLength(this.limiteCaracteresProceso)]],
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(this.limiteCaracteres)]]
    }, { validators: this.validarFechas() });

    this.activeTab = 0;
    this.tipoActual = 'trimestral';
    this.mesSeleccionado = new Date().getMonth();
  }

  ngAfterViewInit(): void {
    // Primera carga cuando el calendario ya existe en el DOM
    setTimeout(() => {
      this.actualizarTituloMes();
      this.cargarEventos();  // ← carga TODO (sin filtros)
    }, 0);
  }

  /** Utilidades */

  cerrarDetalle(): void {
  this.mostrarVerDetalles = false;
}


  get calendarioRefActual(): FullCalendarComponent | undefined {
    switch (this.activeTab) {
      case 0: return this.calendarioTrimestralRef;
      case 1: return this.calendarioSemestralRef;
      case 2: return this.calendarioMedicinaRef;
      default: return undefined;
    }
  }

  private obtenerApiActivo(): CalendarApi {
    const ref = this.calendarioRefActual;
    if (!ref) {
      // fallback para evitar romper si aún no montó
      return {
        gotoDate: () => { /* noop */ },
        getDate: () => new Date(),
        today: () => { /* noop */ },
        prev: () => { /* noop */ },
        next: () => { /* noop */ },
        removeAllEvents: () => { /* noop */ },
        addEventSource: () => { /* noop */ },
        updateSize: () => { /* noop */ }
      } as unknown as CalendarApi;
    }
    return ref.getApi();
  }

  private pintarEventosEnActivo(eventos: EventoFC[]) {
    const api = this.obtenerApiActivo();
    api.removeAllEvents();
    api.addEventSource(eventos);
    setTimeout(() => api.updateSize(), 0);
  }

// Color SIEMPRE por Unidad Académica (ignora el tipo de calendario)
private colorParaUA(idUnidadAcademica?: number): string {
  if (idUnidadAcademica == null) return '#607D8B'; // fallback

  // Si ya lo asignamos antes, reutiliza
  const cached = this.colorCacheUA[idUnidadAcademica];
  if (cached) return cached;

  // Asignación determinista: mismo id → mismo color
  const idx = Math.abs(idUnidadAcademica) % this.PALETA_UA.length;
  const color = this.PALETA_UA[idx];

  this.colorCacheUA[idUnidadAcademica] = color;
  return color;
}

  private actualizarTituloMes(): void {
    const api = this.obtenerApiActivo();
    const fechaActual = api.getDate();
    const opciones: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    this.tituloMes = fechaActual.toLocaleDateString('es-ES', opciones);
  }

  private obtenerIdTipoCalendarioPorTab(tabIndex: number): number {
    return this.idTiposPorTab[tabIndex] ?? 1;
  }

  private obtenerIdCalendarioPorTab(tabIndex: number): number {
    return this.obtenerIdTipoCalendarioPorTab(tabIndex);
  }

  /** Carga de datos (SIN FILTROS: mostrar TODO) */

  cargarEventos(): void {
    const idTipoCalendario = this.obtenerIdTipoCalendarioPorTab(this.activeTab);

    this.srvCalendario.getEventos(idTipoCalendario).subscribe({
      next: (data: any) => {
        const mapeados: EventoFC[] = (data?.result ?? []).map((evento: any) => {
const color = this.colorParaUA(evento?.idUnidadAcademica);
          return {
            title: evento.proceso,
            start: evento.fechaInicio,
            end: evento.fechaFin,
            color,
            extendedProps: {
              descripcion: evento.descripcion,
              producto: evento.nombreUnidadAcademica,
              idUnidadAcademica: evento.idUnidadAcademica,
              observacion: evento.observacion,
              idUnidadAcademicaRegistroObs: evento.idUnidadAcademicaRegistroObs,
              unidadAcademicaRegistroObs: evento.unidadAcademicaRegistroObs,
              idTipoCalendario: evento.idTipoCalendario ?? idTipoCalendario,
              idCalendario: evento.idCalendario
            }
          };
        });

        // 🔑 No filtramos por mes/rango. Pintamos TODO.
        this.eventosCalendario = mapeados;
        this.pintarEventosEnActivo(mapeados);
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
        this.eventosCalendario = [];
        this.pintarEventosEnActivo([]);
      }
    });
  }

  /** Navegación calendario (solo mueven la vista, NO recargan/filtran) */

  irHoy(): void {
    const api = this.obtenerApiActivo();
    api.today();
    const d = api.getDate();
    this.mesSeleccionado = d.getMonth();
    this.actualizarTituloMes();
    // Sin cargar de nuevo; ya tenemos TODO cargado
  }

  navegarAnterior(): void {
    const api = this.obtenerApiActivo();
    api.prev();
    const d = api.getDate();
    this.mesSeleccionado = d.getMonth();
    this.actualizarTituloMes();
  }

  navegarSiguiente(): void {
    const api = this.obtenerApiActivo();
    api.next();
    const d = api.getDate();
    this.mesSeleccionado = d.getMonth();
    this.actualizarTituloMes();
  }

  onDatesSet(_: DatesSetArg): void {
    // Sin recargas; solo sincroniza título/dropdown
    const api = this.obtenerApiActivo();
    const d = api.getDate();
    this.mesSeleccionado = d.getMonth();
    this.actualizarTituloMes();
  }

  onMesSeleccionado(mes: number): void {
    this.mesSeleccionado = mes;
    const api = this.obtenerApiActivo();
    const y = api.getDate().getFullYear();
    api.gotoDate(new Date(y, mes, 1));
    this.actualizarTituloMes();
    // No recargamos; ya tenemos TODO
  }

  onTabChange(index: number): void {
    this.activeTab = index;

    // Parchar idCalendario según pestaña
    this.formRegistro.patchValue({
      idCalendario: this.obtenerIdCalendarioPorTab(this.activeTab)
    });

    // Actualizar tipo textual
    const tipos = ['trimestral', 'semestral', 'medicina'];
    this.tipoActual = tipos[this.activeTab];

    // Esperar a que el calendario de la pestaña se monte y luego cargar TODO
    setTimeout(() => {
      const api = this.obtenerApiActivo();
      const d = api.getDate();
      this.mesSeleccionado = d.getMonth();
      this.actualizarTituloMes();
      this.cargarEventos(); // ← carga TODO para ese tab
    }, 0);
  }

  /** Modales */

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.mostrarVerDetalles = false;
    this.formRegistro.reset({
      idCalendario: this.obtenerIdCalendarioPorTab(this.activeTab)
    });
  }

  /** Guardado */

  postProcesoAcademico(): void {
    this.loadingRegistrar = true;
    const data = this.formRegistro.value;

    if (!this.formRegistro.valid) {
      this.showError = true;
      this.loadingRegistrar = false;
      console.warn('Formulario inválido:', this.formRegistro.errors, data);
      return;
    }

    this.srvCalendario.postProcesoAcademico(data).subscribe({
      next: (response) => {
        this.srvMessage.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: response?.mensaje ?? 'Registro creado',
          life: 3000
        });
        this.cerrarModal();
        this.loadingRegistrar = false;
        this.cargarEventos(); // recargar TODO tras guardar
      },
      error: (error) => {
        console.error('Error al enviar proceso académico:', error?.error?.mensaje ?? error);
        this.srvMessage.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: 'Error al registrar el proceso académico',
          life: 3000
        });
        this.loadingRegistrar = false;
      }
    });
  }

  /** Eventos del calendario */

  verDetallesEvento(arg: EventClickArg): void {
    this.eventoSeleccionado = arg.event;
    this.mostrarVerDetalles = true;
  }

  editarEvento(evento: any): void {
    this.formRegistro.patchValue({
      proceso: evento.title,
      fechaInicio: evento.start,
      fechaFin: evento.end,
      descripcion: evento.extendedProps?.descripcion || ''
    });
    this.mostrarModal = true;
    this.mostrarVerDetalles = false;
  }

  /** Validaciones */

  verificarLimiteCaracteres(): void {
    const descripcion = this.formRegistro.get('descripcion')?.value || '';
    this.showError = descripcion.length > this.limiteCaracteres;
  }

  validarFechas(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const inicio = group.get('fechaInicio')?.value;
      const fin = group.get('fechaFin')?.value;
      return inicio && fin && new Date(inicio) > new Date(fin)
        ? { fechasInvalidas: true }
        : null;
    };
  }
}
