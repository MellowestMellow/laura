// Angular Core
import { Component, HostListener, OnInit } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

@Component({
  selector: 'app-panel-seguridad',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './panel-seguridad.component.html',
  styleUrl: './panel-seguridad.component.scss'
})
export class PanelSeguridadComponent implements OnInit {

  @HostListener('window:resize', ['$event'])


  activeCardIds: number[] = []; // Para tablet, puede tener hasta 2 ids

  isMobile = false;
  isTablet = false;
  isMobileOrTablet = false;


  constructor(
    private router: Router,) { this.checkScreenSize(); }


  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void { }

  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      this.isMobile = width <= 480;
      this.isTablet = width > 480 && width <= 768;
    }
  }

  toggleCard(cardId: number) {
    if (this.isMobile) {
      // Solo 1 activo a la vez en móvil
      if (this.activeCardIds.includes(cardId)) {
        this.activeCardIds = [];
        this.cards.forEach(card => card.isExpanded = false);
      } else {
        this.activeCardIds = [cardId];
        this.cards.forEach(card => card.isExpanded = this.activeCardIds.includes(card.id));
      }
    } else if (this.isTablet) {
      // Hasta 2 activos en tablet
      if (this.activeCardIds.includes(cardId)) {
        // Si ya está activo, lo desactiva
        this.activeCardIds = this.activeCardIds.filter(id => id !== cardId);
      } else if (this.activeCardIds.length < 2) {
        // Si hay menos de 2, añade el nuevo
        this.activeCardIds.push(cardId);
      } else {
        // Si ya hay 2, reemplaza el primero con el nuevo
        this.activeCardIds.shift();
        this.activeCardIds.push(cardId);
      }
      this.cards.forEach(card => card.isExpanded = this.activeCardIds.includes(card.id));
    } else {
      // En desktop o pantallas grandes no expandir nada (o comportamiento normal)
      this.activeCardIds = [];
      this.cards.forEach(card => card.isExpanded = false);
    }
  }

  closeActiveCard() {
    this.activeCardIds = [];
    this.cards.forEach(card => card.isExpanded = false);
  }

  regresarPanel() {
    this.router.navigate(['/ajuste/sistema']);
  }

  // ────────────────────────────────
  // SECCIÓN DE CONFIGURACIONES DEL SISTEMA
  // Menú principal para acceder a los distintos módulos de mantenimiento
  // ────────────────────────────────
  
  cards = [
    {
      id: 1,
      title: 'Bitácora',
      iconClass: 'bi-journal-text', // Registro detallado
      description: 'Consulta del historial de acciones realizadas por los usuarios dentro del sistema.',
      buttonLabel: 'Ver Bitácora',
      routerLink: '/seguridad/bitacora',
      isExpanded: false
    },
    {
      id: 2,
      title: 'Objetos',
      iconClass: 'bi-hdd-stack', // Elementos de sistema o datos
      description: 'Gestión de las entidades u objetos que forman parte del sistema.',
      buttonLabel: 'Gestionar Objetos',
      routerLink: '/mantenimiento/seguridad/objeto',
      isExpanded: false
    },
    {
      id: 3,
      title: 'Parámetros',
      iconClass: 'bi-sliders', // Configuraciones ajustables
      description: 'Administración de parámetros generales que controlan el comportamiento del sistema.',
      buttonLabel: 'Gestionar Parámetros',
      routerLink: '/seguridad/parametro',
      isExpanded: false
    },
    {
      id: 4,
      title: 'Tipo de Notificación',
      iconClass: 'bi-bell', // Clásico ícono de notificación
      description: 'Administración de los diferentes tipos de notificaciones disponibles en el sistema.',
      buttonLabel: 'Gestionar Tipo de Notificaciones',
      routerLink: '/mantenimiento/seguridad/tipo-notificacion',
      isExpanded: false
    },
    {
      id: 5,
      title: 'Tipo de Objeto',
      iconClass: 'bi-box', // Representa categoría o tipo de ítem
      description: 'Clasificación de los objetos del sistema según su naturaleza o función.',
      buttonLabel: 'Gestionar Tipos de Objeto',
      routerLink: '/login',
      isExpanded: false
    },
    {
      id: 6,
      title: 'Estado del Usuario',
      iconClass: 'bi-person-check', // Relacionado a usuarios y estados
      description: 'Administración de los estados que puede tener un usuario, como activo, inactivo o bloqueado.',
      buttonLabel: 'Gestionar Estados de Usuario',
      routerLink: '/login',
      isExpanded: false
    },
  ];


}
