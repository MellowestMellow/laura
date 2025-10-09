// Angular Core
import { Component, HostListener } from '@angular/core';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

@Component({
  selector: 'app-panel',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class PanelComponent {

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  isMobileOrTablet = false;
  activeCardId: number | null = null;

  constructor() {
    this.checkScreenSize();
  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────
  checkScreenSize() {
    this.isMobileOrTablet = window.innerWidth <= 768;
  }

  toggleCard(cardId: number) {
    if (!this.isMobileOrTablet) return;

    if (this.activeCardId === cardId) {
      this.closeActiveCard();
    } else {
      this.activeCardId = cardId;
      this.cards.forEach(card => card.isExpanded = card.id === cardId);
    }
  }

  closeActiveCard() {
    this.activeCardId = null;
    this.cards.forEach(card => card.isExpanded = false);
  }

  onHover(cardId: number) {
    if (!this.isMobileOrTablet) {
      this.cards.forEach(card => card.isExpanded = card.id === cardId);
    }
  }

  onLeave() {
    if (!this.isMobileOrTablet) {
      this.cards.forEach(card => card.isExpanded = false);
    }
  }

  
  // ────────────────────────────────
  // SECCIÓN DE CONFIGURACIONES DEL SISTEMA
  // Menú principal para acceder a los distintos módulos 
  // ────────────────────────────────
  
  cards = [
    {
      id: 1,
      title: 'Crear Ticket',
      image: 'Img.jpg',
      description: 'Para consultar el estado de tu ticket, haz clic en el botón "Consultar Ticket" y serás redirigido a la pantalla donde podrás ver los detalles de tu solicitud.',
      buttonLabel: 'Crear Ticket',
      routerLink: '/ticket/registrar',
      isExpanded: false
    },
    {
      id: 2,
      title: 'Consultar Ticket',
      image: 'Img4.jpg',
      description: 'Para consultar el estado de tu ticket, haz clic en el botón "Consultar Ticket" y serás redirigido a la pantalla donde podrás ver los detalles de tu solicitud.',
      buttonLabel: 'Consultar Ticket',
      routerLink: '/ticket/consultar',
      isExpanded: false
    },
    {
      id: 3,
      title: 'Iniciar Sesión',
      image: 'almmt1.jpg',
      description: 'Para acceder a la plataforma, haz clic en el botón "Iniciar sesión" y serás redirigido a la pantalla de login para que puedas acceder.',
      buttonLabel: 'Iniciar Sesión',
      routerLink: '/login',
      isExpanded: false
    }
  ];

}


