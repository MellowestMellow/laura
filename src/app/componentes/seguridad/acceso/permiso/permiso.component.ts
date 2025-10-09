// Angular Core
import { Component, EventEmitter, Output } from '@angular/core';

// Angular Router
import { ActivatedRoute } from '@angular/router';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { PermisoService } from '../../../../servicios/seguridad/acceso/permiso/permiso.service';
import { RolService } from '../../../../servicios/seguridad/acceso/rol/rol.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';

@Component({
  selector: 'app-permiso',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './permiso.component.html',
  styleUrl: './permiso.component.scss'
})

export class PermisoComponent {

  @Output() loadingCompleted = new EventEmitter<boolean>();

  searchValue: string | undefined;
  idRol: number | null = null;

  nombreRol: string = '';
  idRoles: number = 0;

  loadingtable: boolean = false;

  permisos: any[] = [];
  roles: any[] = [];
  permisosModificados: any[] = [];
  selectedRol: any;

  constructor(
    private messageService: MessageService,
    private RolService: RolService,
    private PermisoService: PermisoService,
    private ActivateRouter: ActivatedRoute,
    private layoutService: LayoutService
  ) {
  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.cargarSelects();
    this.layoutService.setHeader('Objeto');
    this.traerRol();
    this.loadingtable = true;
    this.ActivateRouter.params.subscribe(params => {
      this.idRoles = +params['idRol']; // Obtener el idRol de la URL
    });

    // Recuperar el nombre del rol desde localStorage
    this.nombreRol = this.RolService.getNombreRol();

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

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────

  cargarSelects(): void {

    //Cargar roles
    this.RolService.getRol().subscribe(
      (response: any) => {
        this.roles = response;
      },
      (error) => {
        ////console.error('Error al obtener la información', error);
      }
    );

  }

  getPermisos(idRol: number): void {
    this.PermisoService.getPermisoRol(idRol).subscribe(
      (data: any[]) => {
        // Mapeamos los permisos y mantenemos los datos adicionales
        this.permisos = data.map((permiso, index) => ({
          numero: index + 1,
          idObjeto: permiso.idObjeto,
          objeto: permiso.objeto,
          descripcion: permiso.descripcion,
          permisoAutorizado: Boolean(permiso.permisoAutorizado), // Convertimos a booleano
          permisoInsertar: Boolean(permiso.permisoInsertar),     // Convertimos a booleano
          permisoEliminar: Boolean(permiso.permisoEliminar),     // Convertimos a booleano
          permisoActualizar: Boolean(permiso.permisoActualizar), // Convertimos a booleano
          permisoConsultar: Boolean(permiso.permisoConsultar),   // Convertimos a booleano
          // Puedes agregar más propiedades aquí si las necesitas
        }));
        ////console.log('Permisos obtenidos:', this.permisos);
        this.loadingtable = false;
        this.loadingCompleted.emit(true);
      },
      (error) => {
        this.loadingtable = false;
        this.loadingCompleted.emit(true);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los permisos.',
          life: 3000
        });
      }
    );
  }

  traerRol(): void {
    this.ActivateRouter.paramMap.subscribe(params => {
      const idRolParam = params.get('idRol');
      if (idRolParam !== null) {
        this.idRol = +idRolParam;

        // Llama a la función para cargar los permisos
        this.getPermisos(this.idRol);

        // Asigna el rol seleccionado y actualiza nombreRol
        this.selectedRol = this.idRol;
      } else {
        ////console.error("El parámetro 'idRol' no está presente en la URL.");
        // Maneja el caso donde no se recibe el idRol
      }
    });
  }

  onRolChange(event: any): void {
    const idRol = parseInt(this.selectedRol);
    if (idRol) {  // Si hay un rol seleccionado (el idRol)

      this.getPermisos(idRol);  // Llama al servicio directamente con el idRol
    }
    ////console.log('Este rol es el seleccionado:', idRol);
  }


  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // Actulizar Permisos
  // ────────────────────────────────

  onPermissionChange(permiso: any, permisoField: string): void {
    const idRol = parseInt(this.selectedRol); // Asegura que idRol se asigne correctamente

    // Si el cambio ocurre en permisoAutorizado, ajusta todos los permisos
    if (permisoField === 'permisoAutorizado') {
      const activarTodos = permiso.permisoAutorizado; // true si está activado, false si no

      // Actualiza cada permiso individual en el objeto
      permiso.permisoConsultar = activarTodos;
      permiso.permisoInsertar = activarTodos;
      permiso.permisoEliminar = activarTodos;
      permiso.permisoActualizar = activarTodos;

      // Asegúrate de que cada cambio individual también se registre en permisosModificados
      this.actualizarPermisosModificados(permiso, 'permisoConsultar');
      this.actualizarPermisosModificados(permiso, 'permisoInsertar');
      this.actualizarPermisosModificados(permiso, 'permisoActualizar');
      this.actualizarPermisosModificados(permiso, 'permisoEliminar');
    } else {
      // Actualiza el campo individualmente si no es permisoAutorizado
      this.actualizarPermisosModificados(permiso, permisoField);

      // Si se desactiva permisoConsultar, desactiva todos los permisos y permisoAutorizado
      if (permisoField === 'permisoConsultar' && !permiso.permisoConsultar) {
        permiso.permisoInsertar = false;
        permiso.permisoEliminar = false;
        permiso.permisoActualizar = false;
        permiso.permisoAutorizado = false;

        // Registra los cambios en permisosModificados
        this.actualizarPermisosModificados(permiso, 'permisoInsertar');
        this.actualizarPermisosModificados(permiso, 'permisoEliminar');
        this.actualizarPermisosModificados(permiso, 'permisoActualizar');
        this.actualizarPermisosModificados(permiso, 'permisoAutorizado');
      } else {
        // Si se activa un permiso individual, también activa permisoAutorizado
        if (
          permiso.permisoConsultar ||
          permiso.permisoInsertar ||
          permiso.permisoEliminar ||
          permiso.permisoActualizar
        ) {
          permiso.permisoAutorizado = true;
          permiso.permisoConsultar = true;
          this.actualizarPermisosModificados(permiso, 'permisoConsultar');
          this.actualizarPermisosModificados(permiso, 'permisoAutorizado');
        }
        // Si todos los permisos están desactivados, desactiva permisoAutorizado
        else {
          permiso.permisoAutorizado = false;
          this.actualizarPermisosModificados(permiso, 'permisoAutorizado');
        }
      }
    }

    ////console.log('Permisos modificados:', this.permisosModificados); // Verifica los cambios

    // Llama a la función para guardar los cambios automáticamente
    this.guardarCambios();
  }

  actualizarPermisosModificados(permiso: any, permisoField: string): void {
    const index = this.permisosModificados.findIndex(p => p.idObjeto === permiso.idObjeto);

    if (index > -1) {
      // Si ya existe en el array, actualiza solo el campo modificado
      this.permisosModificados[index] = {
        ...this.permisosModificados[index],
        [permisoField]: permiso[permisoField]
      };
    } else {
      // Si no está en el array, agrega el permiso completo junto con el idRol
      this.permisosModificados.push({
        ...permiso,
        idRol: parseInt(this.selectedRol)
      });
    }
  }

  guardarCambios(): void {
    if (this.permisosModificados.length > 0) {
      this.permisosModificados.forEach(permisoModificado => {
        this.PermisoService.putPermisoRol(permisoModificado).subscribe(
          (response) => {
            ////console.log('Permiso actualizado correctamente', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Operación Exitosa',
              detail: response.message || 'Permiso actualizado correctamente',
              life: 3000
            });
          },
          (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Operación Fallida',
              detail: error.error?.mensaje || 'Error al actualizar el permiso',
              life: 3000
            });
          }
        );
      });

      // Limpia el array de permisosModificados después de guardar los cambios
      this.permisosModificados = [];
    } else {
      ////console.log('No hay cambios para guardar');
    }
  }



}
