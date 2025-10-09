// Angular Core
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Angular Forms
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  FormBuilder,
  FormArray,
  ValidationErrors
} from '@angular/forms';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../../servicios/seguridad/acceso/permiso/permiso.service';
import { RolService } from '../../../../servicios/seguridad/acceso/rol/rol.service';
import { UsuarioService } from '../../../../servicios/seguridad/usuario/usuario.service';

// Servicios - Mantenimiento
import { MantenimientoGeneroService } from '../../../../servicios/mantenimiento/persona/genero/mantenimiento-genero.service';
import { MantenimientoEstadoUsuarioService } from '../../../../servicios/mantenimiento/seguridad/estado-usuario/mantenimiento-estado-usuario.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';

@Component({
  selector: 'app-usuario-ticket',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './usuario-ticket.component.html',
  styleUrl: './usuario-ticket.component.scss'
})
export class UsuarioTicketComponent implements OnInit {

  @Output() loadingCompleted = new EventEmitter<boolean>();

  
  blockSpace: RegExp = /[^s]/;

  nombreUsuario: string = '';
  searchValue: string | undefined;

  usuarios: any[] = [];
  estadoUsuario: any[] = [];
  genero: any[] = [];
  rol: any[] = [];
  rolesTotales: any[] = [];      // Todos los usuarios de la API
  rolesDisponibles: any[] = [];  // Los usuarios filtrados para el select

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  loadingDialogGeneral: boolean = false;
  loadingDialogActualizar: boolean = false;
  loadingDialogInactivar: boolean = false;

  loadingtable: boolean = false;
  isLoadingspinner: boolean = false;
  isLoadingRegistrar: boolean = false;
  isLoadingActualizar: boolean = false;
  isLoadingInactivar: boolean = false;
  isLoadingDatosRol: boolean = false;
  isLoadingRol: boolean = false;

  visibleRegistrar: boolean = false;
  visibleModificar: boolean = false;
  visibleInactivar: boolean = false;
  visibleRol: boolean = false;

  RolesUsuarioForm!: FormGroup;

  RegistrarForm = new FormGroup({
    primerNombre: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+$')]),
    segundoNombre: new FormControl('', [
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+)?$/)
    ]),
    primerApellido: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+$')]),
    segundoApellido: new FormControl('', [
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+)?$/)
    ]),
    idGenero: new FormControl('', Validators.required),
    correo: new FormControl('', [Validators.required, this.validarCorreoUnah]),
    telefono: new FormControl('', Validators.required),
    telefonoAlterno: new FormControl(''),
    numEmpleado: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)]),
    contrasena: new FormControl(''), // Campo para la contraseña
    codigo: new FormControl(''),  // Campo para el código OTP
  },
  );

  ActualizarForm = new FormGroup({
    idUsuario: new FormControl('', Validators.required),
    nombre: new FormControl(''),
    idEstadoUsuario: new FormControl('', Validators.required),
    dfFechaVencimientoUsuario: new FormControl<Date | null>(null, Validators.required)
  },
  );

  InactivarForm = new FormGroup({
    idUsuario: new FormControl('', Validators.required),
    nombre: new FormControl(''),
  },
  );

  RolesForm = new FormGroup({
    idUsuario: new FormControl('', Validators.required),
    rolesSeleccionados: new FormControl(''),
    nombre: new FormControl(''),
  });

  constructor(
    private UsuarioService: UsuarioService,
    private messageService: MessageService,
    private GeneroService: MantenimientoGeneroService,
    private EstadoUsuarioService: MantenimientoEstadoUsuarioService,
    private RolService: RolService,
    private fb: FormBuilder,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private router: Router,
        private layoutService: LayoutService
  ) {
    this.initializeRoles();
  }


  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ───
  ngOnInit(): void {
      this.layoutService.setHeader('Usuarios Externo');
    this.obtenerPermisos();
    this.loadingtable = true;
    this.cargarUsuarios();
    this.cargarSelects();
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 11; // El objeto que estás consultando

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

  applyFilterGlobal(event: Event, table: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(inputValue, 'contains');
  }

  clear(table: any) {
    table.clear();
    this.searchValue = '';  // Limpiar el valor del campo de búsqueda
    table.filterGlobal('', 'contains');  // Limpiar el filtro global
  }

  handleAceptarInactivar() {
    this.isLoadingInactivar = true;
    this.inactivarUsuarioPersona();
  }

  // Métodos para mostrar los distintos diálogos (Registrar, Modificar, Inactivar, Roles)
  showDialog(dialogType: 'Registrar' | 'Modificar' | 'Inactivar' | 'Rol') {
    this[`visible${dialogType}`] = true;
  }

  showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Operación Fallida',
      detail: message,
      life: 3000
    });
  }

  validarCorreoUnah(control: AbstractControl): ValidationErrors | null {
    const correo = control.value;
    if (!correo) return null;

    // Solo permitimos correos que terminen en @unah.hn o @unah.edu.hn
    const pattern = /^[\w-.]+@(unah\.hn|unah\.edu\.hn)$/i;
    return pattern.test(correo) ? null : { dominioInvalido: true };
  }

  regresarPanel() {
    this.router.navigate(['/ajuste/usuario']);
  }

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Manejo de carga, filtrado y errores
  // ────────────────────────────────
  cargarSelects(): void {
    //Cargar estados de usuario
    this.EstadoUsuarioService.getEstadoUsuario().subscribe(
      (response: any) => {
        this.estadoUsuario = response;
      },
      (error) => {
        ////console.error('Error al obtener la información', error);
      }
    );

    //Cargar genero
    this.GeneroService.getGenero().subscribe(
      (response: any) => {
        this.genero = response;
      },
      (error) => {
        ////console.error('Error al obtener la información', error);
      }
    );

    //Cargar roles
    this.RolService.getRol().subscribe(
      (response: any) => {
        this.rolesTotales = response;
        this.actualizarUsuariosDisponibles();
      },
      (error) => {
        console.error('Error al obtener la información', error);
      }
    );
  }

  actualizarUsuariosDisponibles() {
    const idsSeleccionados = this.rolUsuario.controls.map(control => control.get('idRol')?.value);

    this.rolesDisponibles = this.rolesTotales.filter(usuario =>
      !idsSeleccionados.includes(usuario.idUsuario)
    );
  }

  getRolesDisponibles(row: AbstractControl) {
    const idSeleccionado = row.get('idRol')?.value;

    const disponibles = this.rolesTotales.filter(usuario => {
      const esSeleccionadoEnOtro = this.rolUsuario.controls.some(control =>
        control !== row && control.get('idRol')?.value === usuario.idRol
      );

      const esRestringido = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20].includes(usuario.idRol);
      const esElSeleccionado = usuario.idRol === idSeleccionado;

      // Solo incluir si:
      // - No está seleccionado en otro control
      // - Y no es restringido (a menos que sea el que está seleccionado)
      return !esSeleccionadoEnOtro && (!esRestringido || esElSeleccionado);
    });

    return disponibles;
  }

  cargarUsuarios(): void {
    this.loadingtable = true; // Mostrar un estado de carga al inicio
    this.UsuarioService.getUsuarioPersona().subscribe(
      (response: any) => {
        const rolesIncluidos = [17, 19]; // Solo mostrar estos roles

        const usuariosFiltrados = response.filter((usuario: any) => {
          if (!usuario.idRoles) return false; // Excluir si no tiene roles

          const rolesUsuario = usuario.idRoles
            .split(",")
            .map((rol: string) => Number.parseInt(rol.trim(), 10));

          // Incluir si al menos uno de los roles está en la lista de incluidos
          return rolesUsuario.some((rol: number) => rolesIncluidos.includes(rol));
        });

        this.usuarios = usuariosFiltrados.map((usuario: any, index: number) => ({
          numero: index + 1,
          ...usuario,
          fechaVencimiento: new Date(usuario.fechaVencimiento),
        }));

        this.loadingtable = false; // Datos cargados con éxito
         this.loadingCompleted.emit(true);
      },
      (error) => {
        this.loadingtable = false;
        this.showErrorMessage(error); // Mostrar mensaje de error
         this.loadingCompleted.emit(true);
      }
    );
  }

  cargarDatos(usuario: any, tipo: 'Modificar' | 'Inactivar'): void {
    this.loadingDialogGeneral = true;

    // Spinner individual
    if (tipo === 'Modificar') {
      this.loadingDialogActualizar = true;
      this.loadingDialogInactivar = false;
    } else {
      this.loadingDialogActualizar = false;
      this.loadingDialogInactivar = true;
    }

    this.nombreUsuario = usuario.nombre;

    const fechaVencimiento = usuario.fechaVencimiento ? new Date(usuario.fechaVencimiento) : null;

    this.ActualizarForm.patchValue({
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      idEstadoUsuario: usuario.idEstadoUsuario,
      dfFechaVencimientoUsuario: fechaVencimiento,
    });

    this.InactivarForm.patchValue({
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre
    });

    // Simulación de carga
    setTimeout(() => {
      this.loadingDialogGeneral = false;
      this.loadingDialogActualizar = false;
      this.loadingDialogInactivar = false;

      setTimeout(() => {
        this.showDialog(tipo);
      }, 0);
    }, 300);
  }

  cargarDatosRoles(usuario: any): void {
    this.isLoadingDatosRol = true; // Mostrar el spinner al iniciar la carga
    this.nombreUsuario = usuario.nombre;

    // Rellenar los valores iniciales del formulario
    this.RolesForm.patchValue({
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
    });

    this.RolService.getRolUsuario(usuario.idUsuario).subscribe(
      (response: any) => {
        // Procesa la respuesta aquí
        this.rolUsuario.clear();
        response.forEach((rol: any) => {
          const RolGroup = this.fb.group({
            idRol: [rol.idRol, Validators.required],
          });
          this.rolUsuario.push(RolGroup);
        });
        console.log('Roles asignados al usuario:', response);
      },
      (error) => {
        // Maneja el error aquí
        this.isLoadingDatosRol = false;
        console.error('Error al obtener los roles:', error);
      },
      () => {
        // Acción cuando la solicitud finalice (sin importar si fue exitosa o falló)
        this.isLoadingDatosRol = false;
        this.visibleRol = true; // Abrir el diálogo
      }
    );

  }


  // ────────────────────────────────
  // Sección de Gestión Dinámica de Formularios
  // Inicialización y Manipulación de Roles 
  // ────

  initializeRoles() {
    this.RolesUsuarioForm = this.fb.group({
      rolUsuario: this.fb.array([])
    });
  }

  get rolUsuario(): FormArray {
    return this.RolesUsuarioForm.get('rolUsuario') as FormArray;
  }

  // Método para agregar filas a las tablas de formación, redes, software y líneas de investigación
  addRow(tabla: number) {
    if (tabla === 1) {
      const RolGroup = this.fb.group({
        idRol: ['', Validators.required],
      });
      this.rolUsuario.push(RolGroup);  // Agregar al FormArray de formación
      this.actualizarUsuariosDisponibles();
    }
  }

  // Quitar filas de las tablas de formación, redes, software y líneas de investigación
  removeRow(index: number, tabla: number): void {
    if (tabla === 1) {
      if (this.rolUsuario.length > 0) {
        this.rolUsuario.removeAt(index); // Eliminar una línea de investigación
        this.actualizarUsuariosDisponibles();  // <- importante
      }
    }
  }


  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // Inserts, Actualizacion y Eliminacion de Usuarios 
  // ────────────────────────────────

  insertarUsuarioPersona() {
    this.isLoadingRegistrar = true;
    const formdata = this.RegistrarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.UsuarioService.postUsuarioPersona(formdata).subscribe(
      (res: any) => {
        this.cargarUsuarios();
        this.RegistrarForm.reset();
        this.visibleRegistrar = false;
        this.isLoadingRegistrar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Usuario registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el usuario';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarUsuarioPersona() {
    this.isLoadingActualizar = true;
    const formdata = this.ActualizarForm.value;
    // Llamar al servicio para insertar usuario y persona
    this.UsuarioService.putUsuarioPersona(formdata).subscribe(
      (res: any) => {
        this.cargarUsuarios();
        this.ActualizarForm.reset();
        this.visibleModificar = false;
        this.isLoadingActualizar = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Usuario actualizado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el usuario';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarRolUsuario(): void {
    this.isLoadingRol = true;
    const formData = this.RolesForm;
    const formDataValue = formData.value;

    let RolesJSON = '';
    if (this.rolUsuario.value && Array.isArray(this.rolUsuario.value) && this.rolUsuario.value.length > 0) {
      RolesJSON = JSON.stringify(this.rolUsuario.value);
    } else {
      const msg = 'Los roles son requeridos.';
      this.messageService.add({
        severity: 'error',
        summary: 'Operación Fallida',
        detail: msg,
        life: 3000
      });
    }

    const RolesData = formDataValue;
    const data = {
      ...RolesData, // Spread the form data values
      rolesSeleccionados: RolesJSON,  // Include PalabraJSON directly in data
    };
    this.RolService.putRolUsuario(data).subscribe(
      () => {
        // Cerrar el modal después de insertar
        this.visibleRol = false;
        this.isLoadingRol = false; // Ocultar spinner
        this.RolesForm.reset();
        this.cargarUsuarios();
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Los roles del usuario han sido actualizado con exito.',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRol = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar los roles';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  inactivarUsuarioPersona() {
    const formdata = this.InactivarForm.value;

    this.UsuarioService.putInactivarUsuarioPersona(formdata).subscribe(
      (res: any) => {
        this.cargarUsuarios();
        this.InactivarForm.reset();
        this.visibleInactivar = false;
        this.isLoadingInactivar = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Usuario inactivado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingInactivar = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: error.error?.mensaje || 'Error al inactivar el usuario',
          life: 3000
        });
      }
    );
  }

}

