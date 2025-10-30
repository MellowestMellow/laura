// Angular Core
import { Component, OnInit } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

@Component({
  selector: 'app-ajuste-sistema',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './ajuste-sistema.component.html',
  styleUrl: './ajuste-sistema.component.scss'
})

export class AjusteSistemaComponent implements OnInit {

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
      nombre: 'Seguridad',
      descripcion: 'Gestiona el mantenimiento de los catálogos de seguridad, como estados de usuario, roles, objetos, parámetros y configuraciones de autenticación.',
      icono: 'pi pi-shield',
      ruta: '/panel/seguridad'
    },
    {
      nombre: 'Estructura Académica',
      descripcion: 'Gestiona el mantenimiento de catálogos relacionados con la estructura universitaria, como campus, departamentos, carreras, títulos académicos y otras entidades académicas.',
      icono: 'pi pi-building',
      ruta: '/panel/estructura/academica'
    },
    {
      nombre: 'Formación',
      descripcion: 'Gestiona el mantenimiento de catálogos relacionados con los programas de formación, incluyendo modalidades, estados de capacitación y programas educativos.',
      icono: 'pi pi-book',
      ruta: '/panel/formacion'
    },
    {
      nombre: 'Solicitudes',
      descripcion: 'Gestiona el mantenimiento de los catálogos de solicitudes, como tipos, estados y otras configuraciones necesarias para su operación.',
      icono: 'pi pi-paperclip',
      ruta: '/mantenimiento/solicitud/'
    },
    {
       nombre: 'Carga Académica',
       descripcion: 'Gestiona el mantenimiento de catálogos de la carga académica de la unidad.',
       icono: 'pi pi-folder-open',
       ruta: '/mantenimiento/carga/academica'
    },
    // {
    //   nombre: 'Reservación',
    //   descripcion: 'Gestiona el mantenimiento de catálogos relacionados con la gestión de reservaciones, como insumos, recursos y otras configuraciones asociadas.',
    //   icono: 'bi bi-calendar4-week',
    //   ruta: '/panel/reservacion' // Revisa si esta ruta es correcta o si debería ser diferente
    // }

  ];

}