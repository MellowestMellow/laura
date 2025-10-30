// Angular Core
import { Component, Input, OnInit, ViewChild } from '@angular/core';

// Angular Router
import { Router, NavigationEnd, NavigationStart } from '@angular/router';

// RxJS
import { Observable, Subscription } from 'rxjs';
import { filter, tap, switchMap } from 'rxjs/operators';

// PrimeNG Components & Modules
import { Drawer } from 'primeng/drawer';
import { BadgeModule } from 'primeng/badge';
import { MenuItem, MessageService } from 'primeng/api';
import { Popover } from 'primeng/popover';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../../servicios/seguridad/acceso/permiso/permiso.service';
import { BitacoraService } from '../../../../servicios/seguridad/acceso/bitacora/bitacora.service';
import { UsuarioService } from '../../../../servicios/seguridad/usuario/usuario.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';


@Component({
  selector: 'app-header',
  imports: [PrimeNGImports, AngularImports, BadgeModule],
  providers: [MessageService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent implements OnInit {
  @Input() ready: boolean = false;
  @ViewChild('drawerRef') drawerRef!: Drawer;
  @ViewChild('op') op!: Popover;

  activeTab = 0;  // 0 = Notificaciones, 1 = Recordatorio
  visible: boolean = false;

  // Arrays con todos los ítems
  todasNotificaciones: any[] = [];
  notificaciones: any[] = [];
  recordatorios: any[] = [];

  // Subconjuntos para mostrar (por ejemplo, los 5 más recientes)
  notificacionesMostradas: any[] = [];
  recordatoriosMostrados: any[] = [];

  items: MenuItem[] = [];
  objetoPermitido: number[] = [];  // Array para almacenar los ids de objetos permitidos

  numeroNotificaciones: number = 0;

  imagenPerfil: string = '';
  nombreUsuario: string | null = null; // Variable para almacenar el nombre del usuario
  titulo: string = '';

  notificacion: any[] = []; // Almacenar todas las notificaciones
  roles: number[] = []; // Roles del usuario actual
  notificacionesNoLeidas: number = 0;

  isLoadingMarcarLeido: boolean = false;
  visibleMenu: boolean = false;
  isMobile: boolean = false;

  // Contadores para detectar nuevas
  private lastCountNotis = 0;
  private lastCountRecs = 0;
  private audio = new Audio('/notificacion.mp3');
  private recordatorio = new Audio('/recordatorio.mp3');
  private firstNotisLoad = true;
  private firstRecsLoad = true;
  private subs = new Subscription();

  constructor(
    private router: Router,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private BitacoraService: BitacoraService,
    private UsuarioService: UsuarioService,
    private MessageService: MessageService,
    private layoutService: LayoutService
  ) {

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.visible = false;
      this.collapseMenuItems(); // Colapsar los ítems en cada navegación
    });

    this.UsuarioService.noLeidas$.subscribe(count => {
      this.notificacionesNoLeidas = count;
    });

    this.UsuarioService.notificaciones$.subscribe(list => {
      this.notificacion = list;
      this.notificacionesMostradas = list.slice(0, 3);
    });

    this.cargarNotificaciones();
  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit() {
    this.layoutService.header$.subscribe((nuevoTitulo) => {
      this.titulo = nuevoTitulo;
    });
    this.obtenerObjetosPermitidos();
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 590;
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 590;
      });
    }
    this.nombreUsuario = this.AuthService.getNombreUsuario();
    this.UsuarioService.refreshNotificaciones();

    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        if (this.op) {
          this.op.hide(); // o close() según el componente
        }
      });
    this.router.events
    // Suscripción al NavigationEnd, guardada en el subs
    const navSub = this.router.events
      .pipe(
        filter(evt => evt instanceof NavigationEnd),
        tap((evt: NavigationEnd) => {
          // recarga aquí
          this.UsuarioService.refreshNotificaciones();
        })
      )
      .subscribe();

    this.subs.add(navSub);

    // Suscripción a notificaciones
    this.UsuarioService.notificacionesNuevas$
      .pipe(
        tap(list => {
          this.notificaciones = list;
          this.notificacionesMostradas = list.slice(0, 5);
        })
      )
      .subscribe();

    // Suscripción a recordatorios
    this.UsuarioService.recordatorios$
      .pipe(
        tap(list => {
          this.recordatorios = list;
          this.recordatoriosMostrados = list.slice(0, 5);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  closeCallback(e: any): void {
    this.drawerRef.close(e);
    this.collapseMenuItems(); // Colapsar ítems al cerrar
  }

  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }

  onLogoutClick(event: Event): void {
    event.preventDefault();
    this.UsuarioService.clearAll(); // Limpiar notificaciones y contadores
    this.AuthService.logout();
    // Y finalmente redirigir al panel (o login)
    this.router.navigate(['/panel']);
  }

  obtenerObjetosPermitidos() {
    this.roles = this.AuthService.getRolesFromToken() || [];
    //console.log('Roles del usuario desde header:', this.roles);

    // Verificar si el usuario tiene el rol 21 (usuario externo a la direccion de docencia)
    if(!this.roles.includes(21) || this.roles.includes(11) || this.roles.includes(18)) {
      this.visibleMenu = true;
    }

    if (this.roles) {
      this.PermisoService.postPermisosMenu().subscribe({
        next: (respuesta) => {
          // Extrae solo los ids de los objetos permitidos
          this.objetoPermitido = respuesta.map((obj: any) => obj.idObjeto);
          // //console.log("objetos permitidos: " , this.objetosPermitidos);
        },
        error: (error) => {
          // //console.error('Error al obtener permisos de objetos:', error);
        }
      });
    }
  }

  openSidebar(): void {
    this.visible = true;
    this.collapseMenuItems(); // Colapsar ítems al abrir
  }

  collapseMenuItems(): void {
    this.items.forEach(item => {
      if (item.items) {
        item.expanded = false; // Asegurarse de que el menú esté colapsado
      }
    });
  }

  isUlAllowed(permissions: number[]): boolean {
    return permissions.some(permission => this.objetoPermitido.includes(permission));
  }

  // ────────────────────────────────
  // CONTADORES DE NOTIFICACIONES Y RECORDATORIOS
  // Calculan dinámicamente los elementos no leídos
  // ────────────────────────────────
  get unreadCount(): number {
    return this.notificaciones.filter(n => !n.dfLeido).length +
      this.recordatorios.filter(r => !r.dfLeido).length;
  }

  /** Sólo notificaciones nuevas (dfLeido = false y tipo ≠ 12) */
  get unreadNotificationsCount(): number {
    return this.notificaciones.filter(n => !n.dfLeido).length;
  }

  /** Sólo recordatorios nuevos (dfLeido = false y tipo = 12) */
  get unreadRemindersCount(): number {
    return this.recordatorios.filter(r => !r.dfLeido).length;
  }


  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────

  /*cargarNotificaciones(): void {
      this.UsuarioService.getNotificaciónUsuario().subscribe(
        (response: any[]) => {
          // Añadimos expanded y parseamos fecha
          this.todasNotificaciones = response.map(n => ({
            ...n,
            fechaRegistro: new Date(n.fechaRegistro),
            expanded: false
          }));
  
          // Sólo notificaciones nuevas (tipo ≠ 12 y dfLeido = false)
          this.notificaciones = this.todasNotificaciones
            .filter(n => n.idTipoNotificacion !== 12 && !n.dfLeido);
  
          // Recordatorios (tipo = 10), puedes mostrar todos o también solo no leídos
          this.recordatorios = this.todasNotificaciones
            .filter(n => n.idTipoNotificacion === 12);
  
          // Subconjuntos a mostrar
          this.notificacionesMostradas = this.notificaciones.slice(0, 5);
          this.recordatoriosMostrados = this.recordatorios.slice(0, 5);
        },
        err => console.error('Error al cargar notificaciones:', err)
      );
    }*/

  cargarNotificaciones(): Observable<any> {
    return this.UsuarioService.getNotificaciónUsuario().pipe(
      tap((response: any[]) => {
        this.todasNotificaciones = response.map(n => ({
          ...n,
          fechaRegistro: new Date(n.fechaRegistro),
          expanded: false
        }));

        this.notificaciones = this.todasNotificaciones
          .filter(n => n.idTipoNotificacion !== 12 && !n.dfLeido);

        this.recordatorios = this.todasNotificaciones
          .filter(n => n.idTipoNotificacion === 12);

        this.notificacionesMostradas = this.notificaciones.slice(0, 5);
        this.recordatoriosMostrados = this.recordatorios.slice(0, 5);
      })
    );
  }

  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // ────────────────────────────────

  getRuta(n: any): string[] | null {
    const tipo = n.idTipoNotificacion;
    const roles = this.AuthService.getRolesFromToken() || [];

    // Caso 1: tipo 3 ó 4 → /solicitud (Gestión) o /solicitud/usuario (Mis solicitudes)
    if ([3, 4].includes(tipo)) {
      // Si tiene rol 3 o 4 → Gestión de solicitudes
      if (roles.some(r => [3, 4].includes(r))) {
        return ['/solicitud'];
      }
      // Si no → Mis solicitudes
      return ['/solicitud', 'usuario'];
    }

    // Caso 2: tipo 5, 6, 7, 8, 9 → siempre Mis solicitudes
    if ([5, 6, 7, 8, 9].includes(tipo)) {
      return ['/solicitud', 'usuario'];
    }

    if ([13].includes(tipo)) {
      return ['/solicitud'];
    }

    // Caso 3: tipo 10 → Gestión o Mis asignaciones según rol
    if (tipo === 10) {
      // Roles 3 ó 4 → Gestión de solicitudes
      if (roles.some(r => [3, 4].includes(r))) {
        return ['/solicitud'];
      }
      // Roles 14, 15, 16 → Mis asignaciones
      if (roles.some(r => [14, 15, 16].includes(r))) {
        return ['/asignacion', 'usuario'];
      }
      // Si no tiene ninguno de esos roles, no mostrar
      return null;
    }

    // Cualquier otro tipo → ocultar botón
    return null;
  }

  getRutaMenu(): string[] | null {
  const roles = this.AuthService.getRolesFromToken() || [];
  const objetoPermitido = this.objetoPermitido || [];
  const visibleMenu = this.visibleMenu;

  // Si no debe mostrarse el menú, devolver null
  if (!visibleMenu || !objetoPermitido.includes(1)) {
    return null;
  }

  if (roles.some(r => [11,18].includes(r))) {
    return ['/menu/externo'];
  }

  // Si no → Menú externo
  return ['/menu'];
}

  marcarNotificacion() {
    this.isLoadingMarcarLeido = true;

    this.UsuarioService.putNotificacionUsuarioLeidas().pipe(
      switchMap(() => this.cargarNotificaciones())
    ).subscribe(
      () => {
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
