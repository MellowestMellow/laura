// Angular Core
import { Component, HostListener, OnInit } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

@Component({
  selector: 'app-panel-estructura',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './panel-estructura.component.html',
  styleUrl: './panel-estructura.component.scss'
})
export class PanelEstructuraComponent implements OnInit {

  @HostListener('window:resize', ['$event'])

  activeCardIds: number[] = []; // Para tablet, puede tener hasta 2 ids

  isMobile = false;
  isTablet = false;
  isMobileOrTablet = false;

  constructor(private router: Router,) { this.checkScreenSize(); }

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
      title: 'Educación Superior',
      iconClass: 'bi-bank',  // banco/edificio institucional
      description: 'Administración y mantenimiento integral de los datos institucionales de educación superior.',
      buttonLabel: 'Gestionar Universidad',
      routerLink: '/mantenimiento/estructura/academica/universidad',
      isExpanded: false
    },
    {
      id: 2,
      title: 'Organización Académica',
      iconClass: 'bi-building',  // edificio para campus
      description: 'Gestión y actualización de los campus universitarios, sus departamentos académicos y los programas o títulos ofrecidos en cada sede.',
      buttonLabel: 'Gestionar Organización',
      routerLink: '/mantenimiento/estructura/academica/organizacion',
      isExpanded: false
    },
    {
      id: 3,
      title: 'Departamentos',
      iconClass: 'bi bi-kanban',  // grupo de personas para departamentos
      description: 'Mantenimiento y actualización de la información básica de los departamentos académicos, tales como nombre, y datos generales.',
      buttonLabel: 'Gestionar Departamentos',
      routerLink: '/mantenimiento/estructura/academica/departamento',
      isExpanded: false
    },
    {
      id: 4,
      title: 'Facultades',
      iconClass: 'bi-book',  // libro para facultades y áreas académicas
      description: 'Actualización y mantenimiento de la información esencial de las facultades, incluyendo nombres y datos descriptivos básicos.',
      buttonLabel: 'Gestionar Facultades',
      routerLink: '/mantenimiento/estructura/academica/facultad',
      isExpanded: false
    },
    {
      id: 5,
      title: 'Formación Académica',
      iconClass: 'bi bi-mortarboard',
      description: 'Gestión de la formación académica mediante la administración de grados y títulos académicos, permitiendo una organización clara del historial educativo y la estructura profesional.',
      buttonLabel: 'Gestionar Formación',
      routerLink: '/mantenimiento/estructura/academica/formacion',
      isExpanded: false
    }
  ]



}

