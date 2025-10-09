// Angular Core
import { Component, OnInit } from '@angular/core';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../primeng.imports';
import { AngularImports } from '../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../servicios/seguridad/acceso/permiso/permiso.service';

@Component({
  selector: 'app-plan',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.scss'
})
export class PlanComponent implements OnInit {

  constructor(
    private messageService: MessageService,
    private AuthService: AuthService,
    private PermisoService:PermisoService
  ) {  }

columns = [
  { field: 'numero', header: 'N°', minWidth: "5rem", style: { 'text-align': 'center' } },
  { field: 'dimension', header: 'Dimensión', minWidth: "12rem", style: { 'text-align': 'center' } },
  { field: 'indicadorInstitucional', header: 'Indicador de Resultado Institucional', minWidth: "18rem", style: { 'text-align': 'center' } },
  { field: 'resultadoOperativo', header: 'Resultado Operativo (Unidad Ejecutora)', minWidth: "18rem", style: { 'text-align': 'center' } },
  { field: 'indicadorUnidad', header: 'Indicador (Unidad Ejecutora)', minWidth: "18rem", style: { 'text-align': 'center' } },
  { field: 'primerTrimestre', header: 'Primer Trimestre', parent: 'metas', minWidth: "10rem", style: { 'text-align': 'center' } },
  { field: 'segundoTrimestre', header: 'Segundo Trimestre', parent: 'metas', minWidth: "10rem", style: { 'text-align': 'center' } },
  { field: 'tercerTrimestre', header: 'Tercer Trimestre', parent: 'metas', minWidth: "10rem", style: { 'text-align': 'center' } },
  { field: 'cuartoTrimestre', header: 'Cuarto Trimestre', parent: 'metas', minWidth: "10rem", style: { 'text-align': 'center' } }
];

  
  selectedColumns = [...this.columns]; // Mostrar todo por defecto

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  loadingtable: boolean = false;

  ngOnInit(): void {
    this.loadingtable = false;
    this.obtenerPermisos();
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];  
    const idObjeto = 20; // El objeto que estás consultando
  
    this.PermisoService.getPermiso({ idObjeto, roles }).subscribe(
      (permisos: any[]) => {
        if (permisos?.length > 0) {
          const permiso = permisos[0];
          this.permisoActualizar = permiso.permisoActualizar;
          this.permisoInsertar = permiso.permisoInsertar;
          this.permisoEliminar = permiso.permisoEliminar;
        }
      },
      (error) => {
        console.error('Error al obtener los permisos', error);
      }
    );
  }

  getMetasCount(): number {
    return this.selectedColumns.filter(col => col.parent === 'metas').length;
  }

  get globalFields(): string[] {
    return this.selectedColumns.map(c => c.field);
  }
  


  hasMetasColumns(): boolean {
    return this.selectedColumns.some(col => col.parent === 'metas');
  }
  

   // Datos de ejemplo para la tabla
planesOperativos = [
  {
    id: 1,
    numero: '1',
    dimension: 'Económica',
    indicadorInstitucional: 'Incremento en ingresos fiscales',
    resultadoOperativo: 'Mejora en la recaudación tributaria',
    indicadorUnidad: 'Lempiras recaudadas',
    primerTrimestre: 'L 250,000',
    segundoTrimestre: 'L 300,000',
    tercerTrimestre: 'L 350,000',
    cuartoTrimestre: 'L 400,000'
  },
  {
    id: 2,
    numero: '2',
    dimension: 'Social',
    indicadorInstitucional: 'Reducción de la pobreza',
    resultadoOperativo: 'Implementación de programas sociales',
    indicadorUnidad: 'Fondos invertidos en programas',
    primerTrimestre: 'L 1,200,000',
    segundoTrimestre: 'L 2,500,000',
    tercerTrimestre: 'L 3,800,000',
    cuartoTrimestre: 'L 5,000,000'
  },
  {
    id: 3,
    numero: '3',
    dimension: 'Ambiental',
    indicadorInstitucional: 'Reducción de emisiones de CO2',
    resultadoOperativo: 'Implementación de energías renovables',
    indicadorUnidad: 'Inversión en proyectos ambientales',
    primerTrimestre: 'L 500,000',
    segundoTrimestre: 'L 1,200,000',
    tercerTrimestre: 'L 2,000,000',
    cuartoTrimestre: 'L 3,500,000'
  },
  {
    id: 4,
    numero: '4',
    dimension: 'Institucional',
    indicadorInstitucional: 'Mejora en la transparencia',
    resultadoOperativo: 'Publicación de informes de gestión',
    indicadorUnidad: 'Gasto en herramientas de transparencia',
    primerTrimestre: 'L 150,000',
    segundoTrimestre: 'L 300,000',
    tercerTrimestre: 'L 450,000',
    cuartoTrimestre: 'L 600,000'
  },
  {
    id: 5,
    numero: '5',
    dimension: 'Educativa',
    indicadorInstitucional: 'Aumento en la tasa de escolaridad',
    resultadoOperativo: 'Construcción de nuevas escuelas',
    indicadorUnidad: 'Inversión en infraestructura educativa',
    primerTrimestre: 'L 2,000,000',
    segundoTrimestre: 'L 5,000,000',
    tercerTrimestre: 'L 8,000,000',
    cuartoTrimestre: 'L 10,000,000'
  },
  {
    id: 6,
    numero: '6',
    dimension: 'Salud',
    indicadorInstitucional: 'Reducción de mortalidad infantil',
    resultadoOperativo: 'Implementación de programas de vacunación',
    indicadorUnidad: 'Gasto en vacunación infantil',
    primerTrimestre: 'L 600,000',
    segundoTrimestre: 'L 700,000',
    tercerTrimestre: 'L 800,000',
    cuartoTrimestre: 'L 900,000'
  }
];



  
}
