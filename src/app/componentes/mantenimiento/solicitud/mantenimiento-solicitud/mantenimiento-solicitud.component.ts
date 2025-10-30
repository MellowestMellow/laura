// Angular Core
import { Component } from '@angular/core';

// Angular Forms
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Angular Router
import { Router } from '@angular/router';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../../servicios/seguridad/acceso/permiso/permiso.service';

// Servicios - Solicitud
import { TicketService } from '../../../../servicios/solicitud/ticket/ticket.service';

// Servicios - Mantenimiento
import { MantenimientoSolicitudService } from '../../../../servicios/mantenimiento/solicitud/mantenimiento-solicitud.service';

@Component({
  selector: 'app-mantenimiento-solicitud',
  imports: [AngularImports, PrimeNGImports],
  providers: [MessageService],
  templateUrl: './mantenimiento-solicitud.component.html',
  styleUrl: './mantenimiento-solicitud.component.scss'
})

export class MantenimientoSolicitudComponent {

  // Formularios de Registro
  RegistrarEstadoForm!: FormGroup;
  RegistrarTipoSolicitudForm!: FormGroup;

  // Formularios de Edición
  EditarEstadoForm!: FormGroup;
  EditarTipoSolicitudForm!: FormGroup;
  EditarEtapaSolicitudForm!: FormGroup;
  EditarCategoriaSolicitudForm!: FormGroup;

  // Variables de estado para los loaders
  isTipoSolicitudLoaded: boolean = false;
  isEstadoSolicitudLoaded: boolean = false;
  isEtapaSolicitudLoaded: boolean = false;
  isCategoriaSolicitudLoaded: boolean = false;

  // Variables de visibilidad para los formularios
  visibleTipoSolicitud: boolean = false;
  visibleEstadoSolicitud: boolean = false;
  visibleEtapaSolicitud: boolean = false;
  visibleCategoriaSolicitud: boolean = false;
  visibleActualizarCategoria: boolean = false;
  visibleActualizarTipo: boolean = false;
  visibleActualizarEstado: boolean = false;
  visibleActualizarEtapa: boolean = false;

  // Arreglos para la carga de datos
  estadosSolicitud: any[] = [];
  tiposSolicitud: any[] = [];
  etapasSolicitud: any[] = [];
  categoriasSolicitud: any[] = [];
  rolesUsuario: any[] = [];
  tiposPorCategorias: any[] = [];

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  searchValue: string | undefined;

  // Variables para manejo de tabs
  activeTab: number = 0;
  tabActivoIndex: number = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private ticketService: TicketService,
    private messageService: MessageService,
    private solicitudService: MantenimientoSolicitudService,
    private permisoService: PermisoService,
    private router: Router,
  ) {
    this.EditarCategoriaSolicitudForm = this.fb.group({
      idCategoria: new FormControl('', Validators.required),
      nombreCategoria: new FormControl('', Validators.required),
      tiposSolicitud: this.fb.array([]),
    });

    this.EditarTipoSolicitudForm = this.fb.group({
      idTipoSolicitud: new FormControl('', Validators.required),
      idCategoria: new FormControl('', Validators.required),
      nombreTipoSolicitud: new FormControl('', Validators.required),
    });

    this.EditarEstadoForm = this.fb.group({
      idEstadoSolicitud: new FormControl('', Validators.required),
      estadoSolicitud: new FormControl('', Validators.required),
    });

    this.EditarEtapaSolicitudForm = this.fb.group({
      idEtapaSolicitud: new FormControl('', Validators.required),
      etapa: new FormControl('', Validators.required),
    });

    this.RegistrarEstadoForm = this.fb.group({
      estadoSolicitud: new FormControl('', Validators.required),
    });

    this.RegistrarTipoSolicitudForm = this.fb.group({
      idCategoriaTipoSolicitud: new FormControl('', Validators.required),
      tipoSolicitud: new FormControl('', Validators.required),
    });
  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit() {
    this.obtenerPermisos();
    this.onTabChange(0);
  }

  onTabChange(event: string | number): void {
    const index = Number(event);
    this.tabActivoIndex = index;
    // Desactiva todos los loaders
    this.visibleCategoriaSolicitud = false
    this.visibleTipoSolicitud = false;
    this.visibleEtapaSolicitud = false;
    this.visibleEstadoSolicitud = false;

    console.log('Tab cambiado a:', index);
    // Activa el loader de la pestaña seleccionada y lanza la carga
    switch (index) {
      case 0:
        this.visibleCategoriaSolicitud = true;
        this.cargarCategorias();
        break;
      case 1:
        this.visibleTipoSolicitud = true;
        this.cargarTiposSolicitud();
        break;
      case 2:
        this.visibleEtapaSolicitud = true;
        this.cargarEtapasSolicitud();
        break;
      case 3:
        this.visibleEstadoSolicitud = true;
        this.cargarEstadosSolicitud();
        break;
    }
  }

  obtenerPermisos(): void {
    const roles = this.authService.getRolesFromToken() ?? [];
    this.rolesUsuario = roles; // Guardas los roles
    const idObjeto = 29; // El objeto que estás consultando

    this.permisoService.getPermiso({ idObjeto, roles }).subscribe(
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

  applyFilterGlobal(event: Event, table: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  clear(table: any) {
    table.clear();
    this.searchValue = '';  // Limpiar el valor del campo de búsqueda
    table.filterGlobal('', 'contains');  // Limpiar el filtro global
  }

  regresarPanel() {
    this.router.navigate(['/ajuste/sistema']);
  }

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────

  //  Carga las categorías de solicitud desde el servicio
  cargarCategorias(): void {
    this.isCategoriaSolicitudLoaded = true;
    this.solicitudService.getCategorias().subscribe({
      next: (data: any) => {
        this.categoriasSolicitud = data.categorias;

        // Parsear los tipos si vienen como string
        this.categoriasSolicitud.forEach((categoria: any) => {
          try {
            // Asegúrate de parsear el campo 'tipos' si es string
            if (typeof categoria.tipos === 'string') {
              categoria.tipos = JSON.parse(categoria.tipos);
            }

            // Usa idCategoriaTipoSolicitud como clave
            this.tiposPorCategorias[categoria.idCategoriaTipoSolicitud] = categoria.tipos.map(
              (tipo: any) => tipo.tipoSolicitud
            );
          } catch (error) {
            console.error('Error al parsear tipos para categoría', categoria, error);
            this.tiposPorCategorias[categoria.idCategoriaTipoSolicitud] = [];
          }
        });

        this.isCategoriaSolicitudLoaded = false;
        console.log('Categorías de solicitud:', this.categoriasSolicitud);
        console.log('Tipos por Categorías :', this.tiposPorCategorias);
      },
      error: (error: any) => {
        this.isCategoriaSolicitudLoaded = false;
        console.error('Error al cargar las categorías de solicitud:', error);
      }
    });
  }

  // Carga los tipos de solicitud desde el servicio
  cargarTiposSolicitud(): void {
    this.isTipoSolicitudLoaded = true;
    this.ticketService.getTipoSolicitud(null).subscribe({
      next: (data: any) => {
        this.tiposSolicitud = data;

        this.isTipoSolicitudLoaded = false;
        console.log('Tipos de solicitud:', this.tiposSolicitud);
      },
      error: (error: any) => {
        this.isTipoSolicitudLoaded = false;
        console.error('Error al cargar tipos de solicitud:', error);
      }
    });
  }

  // Carga los estados de solicitud desde el servicio
  cargarEstadosSolicitud(): void {
    this.isEstadoSolicitudLoaded = true;
    this.solicitudService.getEstados().subscribe({
      next: (data: any) => {
        this.estadosSolicitud = data.estados;

        this.isEstadoSolicitudLoaded = false;
        console.log('Estados de solicitud:', this.estadosSolicitud);
      },
      error: (error: any) => {
        this.isEstadoSolicitudLoaded = false;
        console.error('Error al cargar estados de solicitud:', error);
      }
    });

  }

  // Carga las etapas de solicitud desde el servicio
  cargarEtapasSolicitud(): void {
    this.isEtapaSolicitudLoaded = true;
    this.solicitudService.getEtapas().subscribe({
      next: (data: any) => {
        this.etapasSolicitud = data.etapas;

        this.isEtapaSolicitudLoaded = false;
        console.log('Etapas de solicitud:', this.etapasSolicitud);
      },
      error: (error: any) => {
        this.isEtapaSolicitudLoaded = false;
        console.error('Error al cargar etapas de solicitud:', error);
      }
    });

  }

  // Carga los datos de una categoría para actualizarla
  cargarDatosCategoria(categoria: any): void {
    this.EditarCategoriaSolicitudForm.patchValue({
      idCategoria: categoria.idCategoriaTipoSolicitud,
      nombreCategoria: categoria.categoriaTipoSolicitud,
      tiposSolicitud: this.tiposPorCategorias // EN MÉTODO DE ACTUALIZAR PONER EN UNA CONTANTE ESTE VALOR Y AGREGAR LOS NUEVOS QUE SE AGREGUEN CON UN PATCHVALUE
    });

    this.visibleActualizarCategoria = true;
  }

  // Carga los datos de un tipo de solicitud para actualizarlo
  cargarDatosTipo(tipo: any): void {
    console.log('Tipo recibido para editar:', tipo);
    this.EditarTipoSolicitudForm.patchValue({
      idTipoSolicitud: tipo.idTipoSolicitud,
      idCategoria: tipo.idCategoriaTipoSolicitud,
      nombreTipoSolicitud: tipo.tipoSolicitud
    });

    this.visibleActualizarTipo = true;
  }

  // Carga los datos de un estado de solicitud para actualizarlo
  cargarDatosEstado(estado: any): void {
    this.EditarEstadoForm.patchValue({
      idEstadoSolicitud: estado.idEstadoSolicitud,
      estadoSolicitud: estado.estadoSolicitud
    });

    this.visibleActualizarEstado = true;
  }

  // Carga los datos de una etapa de solicitud para actualizarla
  cargarDatosEtapa(etapa: any): void {
    this.EditarEtapaSolicitudForm.patchValue({
      idEtapaSolicitud: etapa.idEtapaSolicitud,
      etapa: etapa.etapa
    });

    this.visibleActualizarEtapa = true;
  }


  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // ────────────────────────────────
  // Registra un nuevo tipo de solicitud
  registrarTipoSolicitud(): void {
    let data = this.RegistrarTipoSolicitudForm.value;
    this.solicitudService.postTipoSolicitud(data).subscribe(
      (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Tipo de Solicitud Registrado',
          detail: 'El tipo de solicitud ha sido registrado exitosamente.',
          life: 3000
        });
        this.cargarTiposSolicitud();
        this.visibleActualizarTipo = false;
      },
      (error: any) => {
        const msg = error.error?.mensaje || 'Error al registrar el tipo de solicitud';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  // Registra un nuevo estado de solicitud
  registrarEstadoSolicitud(): void {
    let data = this.RegistrarEstadoForm.value;
    this.solicitudService.postEstadoSolicitud(data).subscribe(
      (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Estado de Solicitud Registrado',
          detail: 'El estado de solicitud ha sido registrado exitosamente.',
          life: 3000
        });
        this.cargarEstadosSolicitud();
        this.visibleActualizarEstado = false;
      },
      (error: any) => {
        const msg = error.error?.mensaje || 'Error al registrar el estado de solicitud';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

}
