// Angular Core
import { Component, HostListener, OnInit } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

@Component({
  selector: 'app-panel-plan',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './panel-plan.component.html',
  styleUrl: './panel-plan.component.scss'
})

export class PanelPlanComponent implements OnInit {

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
      title: 'Dimensiónes del Plan',
      iconClass: 'bi-diagram-3', // Representa estructura o dimensiones
      description: 'Administración de las dimensiones que componen el plan formativo, como competencias, objetivos y áreas de conocimiento.',
      buttonLabel: 'Gestionar Dimensiones',
      routerLink: '/login',
      isExpanded: false
    },
    {
      id: 2,
      title: 'Periodos del Plan',
      iconClass: 'bi-calendar-range', // Mejor para periodos o tiempos
      description: 'Gestión y configuración de los periodos académicos dentro del plan de formación, como semestres o trimestres.',
      buttonLabel: 'Gestionar Periodos',
      routerLink: '/login',
      isExpanded: false
    },
  ];

}


