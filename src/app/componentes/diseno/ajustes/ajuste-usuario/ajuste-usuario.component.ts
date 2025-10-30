// Angular Core
import { Component, OnInit } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

@Component({
  selector: 'app-ajuste-usuario',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './ajuste-usuario.component.html',
  styleUrl: './ajuste-usuario.component.scss'
})

export class AjusteUsuarioComponent implements OnInit {

  searchText = ""
  filteredAjustes: any[] = []; 
  responsiveOptions: any[] | undefined;

  searchTerm: string = ''; 

  constructor(private router: Router) {
    this.filteredAjustes = [...this.ajustes];
  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────
  ngOnInit(): void {
    this.responsiveOptions = [
      { breakpoint: '1400px', numVisible: 2, numScroll: 1 },
      { breakpoint: '1199px', numVisible: 2, numScroll: 1 },
      { breakpoint: '767px', numVisible: 2, numScroll: 1 },
      { breakpoint: '575px', numVisible: 1, numScroll: 1 },
    ];
  }

  goToModule(ajuste: any): void {
    this.router.navigate([ajuste.ruta]);
  }

  searchOptions(): void {
    if (!this.searchTerm.trim()) {
      // Si no hay término de búsqueda, muestra todos los ajustes
      this.filteredAjustes = [...this.ajustes];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();

    // Filtrar los ajustes por nombre o descripción
    this.filteredAjustes = this.ajustes.filter(ajuste =>
      ajuste.nombre.toLowerCase().includes(searchLower) ||
      ajuste.descripcion.toLowerCase().includes(searchLower)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredAjustes = [...this.ajustes];
  }

  // ────────────────────────────────
  // SECCIÓN DE CONFIGURACIONES DEL SISTEMA
  // Menú principal para acceder a los distintos módulos de mantenimiento
  // ────────────────────────────────
  ajustes: any[] = [
    {
      nombre: 'Usuarios Internos de la Direccion',
      descripcion: 'Administra los usuarios internos que forman parte de la dirección, permitiendo gestionar accesos, perfiles y configuraciones internas.',
      icono: 'pi pi-users',
      ruta: '/seguridad/usuario'
    },
    {
      nombre: 'Usuarios de Tickets',
      descripcion: 'Administra los usuarios que gestionan o reportan tickets, permitiendo su seguimiento y control dentro del sistema de soporte.',
      icono: 'pi pi-ticket',
      ruta: '/seguridad/usuario/ticket'
    },
  ];

}