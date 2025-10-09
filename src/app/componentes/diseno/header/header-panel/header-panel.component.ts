// Angular Core
import { Component, ViewChild } from '@angular/core';

// Angular Router
import { Router} from '@angular/router';

// PrimeNG Components & Modules
import { Drawer } from 'primeng/drawer';
import { MenuItem } from 'primeng/api';
import { Popover } from 'primeng/popover';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';

@Component({
  selector: 'app-header-panel',
   imports: [PrimeNGImports, AngularImports],
  templateUrl: './header-panel.component.html',
  styleUrl: './header-panel.component.scss'
})

export class HeaderPanelComponent {

  @ViewChild('drawerRef') drawerRef!: Drawer;
  @ViewChild('op') op!: Popover;

  visible: boolean = false;

  items: MenuItem[] = [];
  notificacion: any[] = [];

  objetosPermitidos: number[] = [];  // Array para almacenar los ids de objetos permitidos
  numeroNotificaciones: number = 0;
 

  imagenPerfil: string = '';
  nombreUsuario: string | null = null; // Variable para almacenar el nombre del usuario
  
  isMobile: boolean = false;
  constructor(
    private router: Router,
    private AuthService: AuthService,
  ) {

  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 590;
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 590;
      });
    }
    this.nombreUsuario = this.AuthService.getNombreUsuario();

    this.items = [
      {
          label: 'Inicio',
          icon: 'pi pi-home',
          route: '/panel'
      },
      {
          label: 'Ticket',
          icon: 'pi pi-search',
          items: [
              {
                  label: 'Crear Ticket',
                  icon: 'pi pi-bolt',
                  route: '/ticket/registrar'
              },
              {
                separator: true,
            },
              {
                  label: 'Consultar Ticket',
                  icon: 'pi pi-server',
                  route: '/ticket/consultar'
              },
          ],
      },
      {
        label: 'Iniciar Sesión',
        icon: 'pi pi-home',
        route: '/login'
    },
  ];

  }

  closeCallback(e: any): void {
    this.drawerRef.close(e);

  }

  onLogoutClick(event: Event): void {
    event.preventDefault();
    this.AuthService.logout();
    this.router.navigate(['/panel']);
  }

}
