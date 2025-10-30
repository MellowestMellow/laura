// Angular Core
import { Component, HostListener, OnInit } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

@Component({
  selector: 'app-panel-formacion',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './panel-formacion.component.html',
  styleUrl: './panel-formacion.component.scss'
})

export class PanelFormacionComponent implements OnInit {

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
      title: 'Estado de la Formación',
      iconClass: 'bi-clipboard-check', // Icono representativo de estado o verificación
      description: 'Gestión de los distintos estados académicos en los que puede encontrarse una formación, como activa, suspendida o finalizada.',
      buttonLabel: 'Gestionar Estados',
      routerLink: '/mantenimiento/formacion/estado',
      isExpanded: false
    },
    {
      id: 2,
      title: 'Modalidad de la Formación',
      iconClass: 'bi-laptop', // Representa bien la educación virtual/presencial
      description: 'Administración de las modalidades de formación como presencial, virtual, híbrida u otras variantes según el plan académico.',
      buttonLabel: 'Gestionar Modalidades',
      routerLink: '/mantenimiento/formacion/modalidad',
      isExpanded: false
    },
  ]

}

