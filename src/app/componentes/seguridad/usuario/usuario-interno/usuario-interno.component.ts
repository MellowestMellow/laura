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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  selector: 'app-usuario-interno',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './usuario-interno.component.html',
  styleUrl: './usuario-interno.component.scss'
})
export class UsuarioInternoComponent implements OnInit {

  @Output() loadingCompleted = new EventEmitter<boolean>();

  
  blockSpace: RegExp = /[^s]/;

  nombreUsuario: string = '';
  searchValue: string | undefined;
  unidades: any[] = [];
  usuarios: any[] = [];
  estadoUsuario: any[] = [];
  genero: any[] = [];
  rol: any[] = [];
  rolesTotales: any[] = [];      // Todos los usuarios de la API
  rolesDisponibles: any[] = [];  // Los usuarios filtrados para el select
  roles: number[] =  [];
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
  primerNombre: new FormControl('', [
    Validators.required, 
    Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+$')
  ]),
  segundoNombre: new FormControl('', [
    Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+)?$/)
  ]),
  primerApellido: new FormControl('', [
    Validators.required, 
    Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+$')
  ]),
  segundoApellido: new FormControl('', [
    Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+)?$/)
  ]),
  idGenero: new FormControl('', Validators.required),
  correo: new FormControl('', [Validators.required, this.validarCorreoUnah]),
  telefono: new FormControl('', Validators.required),
  telefonoAlterno: new FormControl(''),
  numEmpleado: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)]),
  contrasena: new FormControl(''), // contraseña generada
  codigo: new FormControl(''),     // código OTP
  idUnidadAcademica: new FormControl('')
});



  ActualizarForm = new FormGroup({
    idUsuario: new FormControl('', Validators.required),
    nombre: new FormControl(''),
    idEstadoUsuario: new FormControl('', Validators.required),
    dfFechaVencimientoUsuario: new FormControl<Date | null>(null, Validators.required),
     idUnidadAcademica: new FormControl('')
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
  // ────────────────────────────────

  ngOnInit(): void {
      this.layoutService.setHeader('Usuarios Interno');
    this.obtenerPermisos();
    this.loadingtable = true;
    this.cargarUsuarios();
    this.cargarSelects();
  }

 onSubmitActualizar() {
  const estado = this.ActualizarForm.get('idEstadoUsuario')?.value;
  const estadoNum = Number(estado);

  // Si el estado es 2 o 3, mostrar diálogo de confirmación
  if (estadoNum === 2 || estadoNum === 3) {
    this.visibleInactivar = true;
    return; // No actualizar todavía
  }

  // Si no, actualiza directamente
  this.actualizarUsuarioPersona();
}

handleAceptarInactivar() {
  this.isLoadingInactivar = true;

  // Cierra el diálogo de inactivación
  this.visibleInactivar = false;

  // Llama a la función real de actualización
  this.actualizarUsuarioPersona();

  // Finaliza el loader del diálogo
  this.isLoadingInactivar = false;
}

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    this.roles = roles;
    const idObjeto = 9; // El objeto que estás consultando

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
        //console.error('Error al obtener los permisos', error);
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

  // handleAceptarInactivar() {
  //   this.isLoadingInactivar = true;
  //   this.inactivarUsuarioPersona();
  // }
  

  // Métodos para mostrar los distintos diálogos (Registrar, Modificar, Inactivar, Roles)
showDialog(dialogType: 'Registrar' | 'Modificar' | 'Inactivar' | 'Rol') {
  const roles = this.AuthService.getRolesFromToken() ?? [];

  if (roles.includes(1) && (dialogType === 'Registrar' || dialogType === 'Modificar')) {
    
    // Cargar unidades primero
    this.UsuarioService.getUnidadesAcademicas().subscribe({
      next: (data) => {
        // Aseguramos que los IDs sean numéricos
        this.unidades = data;
          this[`visible${dialogType}`] = true;
      },
      error: (err) => {
        console.error('Error al obtener las unidades académicas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las unidades académicas.',
          life: 3000
        });
      }
    });
      this.loadingDialogGeneral = false;
      this.loadingDialogActualizar = false;
  } else {
     this[`visible${dialogType}`] = true;
  }
        this.loadingDialogGeneral = false;
      this.loadingDialogActualizar = false;
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
        //console.error('Error al obtener la información', error);
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

      const esRestringido = [17, 19, 20, 12, 13, 11, 18].includes(usuario.idRol);
      const esElSeleccionado = usuario.idRol === idSeleccionado;

      // Solo incluir si:
      // - No está seleccionado en otro control
      // - Y no es restringido (a menos que sea el que está seleccionado)
      return !esSeleccionadoEnOtro && (!esRestringido || esElSeleccionado);
    });

    return disponibles;
  }

  cargarUnidades(): void {

    this.UsuarioService.getUnidadesAcademicas().subscribe({
      next: (data) => {
        this.unidades = data; // Guardar los datos obtenidos del backend
      },
      error: (err) => {
        console.error('Error al obtener las unidades académicas:', err);
      }});
  }
  
cargarUsuarios(): void {
  this.loadingtable = true; // Mostrar estado de carga

  this.UsuarioService.getUsuarioPersona().subscribe(
    (response: any) => {
      // ✅ Cargar todos los usuarios sin filtrar por roles
      this.usuarios = response.map((usuario: any, index: number) => ({
        numero: index + 1,
        ...usuario,
        fechaVencimiento: usuario.fechaVencimiento
          ? new Date(usuario.fechaVencimiento)
          : null, // Maneja posibles nulls
      }));

      this.loadingtable = false;
      this.loadingCompleted.emit(true);
    },
    (error) => {
      this.loadingtable = false;
      this.loadingCompleted.emit(true);
      this.showErrorMessage(error);
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
      idUnidadAcademica: usuario.idUnidadAcademica,
      dfFechaVencimientoUsuario: fechaVencimiento,
    });

    console.log('Usuario unidad académica:', usuario.idUnidadAcademica);

    this.InactivarForm.patchValue({
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre
    });

    // Simulación de carga
    setTimeout(() => {

      setTimeout(() => {
        this.showDialog(tipo);
      }, 0);
    }, 500);
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
        //console.log('Roles asignados al usuario:', response);
      },
      (error) => {
        // Maneja el error aquí
        this.isLoadingDatosRol = false;
        //console.error('Error al obtener los roles:', error);
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
get tituloUsuarios(): string {
  if (this.roles.includes(1)) {
    return 'Usuarios del sistema';
  } else if (this.usuarios.length) {
    return `Usuarios de ${this.usuarios[0].nombreUnidadAcademica}`;
  } else {
    return 'Usuarios Totales';
  }
}

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

  // Tomar valores del formulario
  const formdata = this.RegistrarForm.getRawValue(); // incluye controles deshabilitados

  // 🔹 Asegurar que idUnidadAcademica se tome del token si no viene del formulario
  formdata.idUnidadAcademica = formdata.idUnidadAcademica;

  // Llamar al servicio para insertar usuario y persona
  this.UsuarioService.postUsuarioPersona(formdata).subscribe(
    (res: any) => {
      this.cargarUsuarios();
      this.RegistrarForm.reset();
      // Volver a asignar la unidad académica después de reset
      this.RegistrarForm.get('idUnidadAcademica')?.setValue(formdata.idUnidadAcademica);

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

    // Obtener valores del formulario
    const formdata = { ...this.ActualizarForm.value };

    // Si idUnidadAcademica está vacío, eliminarlo para no enviarlo
    if (!formdata.idUnidadAcademica) {
      delete formdata.idUnidadAcademica;
    }

    // Llamar al servicio para actualizar usuario y persona
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


  // Método para enviar los roles seleccionados al backend
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

  getImageBase64(url: string): Promise<{ base64: string, width: number, height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve({ base64: dataURL, width: img.width, height: img.height });
      };
      img.onerror = () => reject('Error cargando imagen');
      img.src = url;
    });
  }

async generarReporteExcel() {
  let nombreUnidad: string | null = null;

  if (this.usuarios.length) {
    const unidades = Array.from(new Set(this.usuarios.map(u => u.nombreUnidadAcademica)));
    nombreUnidad = unidades.length === 1 ? unidades[0] : null;
  }

  const nombreArchivo = nombreUnidad 
    ? `listado_usuarios_${nombreUnidad}.xlsx` 
    : 'listado_usuarios_completo.xlsx';

  // Crear libro de Excel
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Usuarios');

  // Definir columnas
  sheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 30 },
    { header: 'Correo', key: 'correo', width: 30 },
    { header: 'Número', key: 'numeroEmpleado', width: 15 },
    { header: 'Unidad Académica', key: 'unidad', width: 30 },
    { header: 'Estado', key: 'estado', width: 15 },
    { header: 'Fecha Vencimiento', key: 'fecha', width: 25 }
  ];

  // Agregar filas
  this.usuarios.forEach(usuario => {
    sheet.addRow({
      nombre: usuario.nombre || 'No proporcionado',
      correo: usuario.correo || 'No proporcionado',
      numeroEmpleado: usuario.numeroEmpleado || 'No proporcionado',
      unidad: usuario.nombreUnidadAcademica || 'No proporcionado',
      estado: usuario.estadoUsuario || 'No proporcionado',
      fecha: usuario.fechaVencimiento 
        ? new Date(usuario.fechaVencimiento).toLocaleString('es-HN', { 
            day: '2-digit', month: 'long', year: 'numeric', 
            hour: 'numeric', minute: '2-digit', second: '2-digit', 
            hour12: true 
          }) 
        : 'No proporcionado'
    });
  });

  // Estilo encabezado
  sheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '003366FF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Altura filas
  sheet.eachRow(row => { row.height = 20; });

  // Guardar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, nombreArchivo);
}

async generarReportePDF() {
  let nombreUnidad: string | null = null;

  if (this.usuarios.length) {
    const unidades = Array.from(new Set(this.usuarios.map(u => u.nombreUnidadAcademica)));
    nombreUnidad = unidades.length === 1 ? unidades[0] : null;
  }

  const nombreArchivo = nombreUnidad 
    ? `listado_usuarios_${nombreUnidad}.pdf` 
    : 'listado_usuarios_completo.pdf';

  // Obtener logos
  const [logoIzq, logoDer] = await Promise.all([
    this.getImageBase64('/LOGO VRA-DD.png'),
    this.getImageBase64('/UNAH_Azul.png')
  ]);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const fechaStr = new Date().toLocaleString('es-HN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  });

  // Escala logos
  const scaleIzq = 0.05;
  const scaleDer = 0.065;
  const logoIzqWidth = logoIzq.width * scaleIzq;
  const logoIzqHeight = logoIzq.height * scaleIzq;
  const logoDerWidth = logoDer.width * scaleDer;
  const logoDerHeight = logoDer.height * scaleDer;

  // Encabezado
  doc.addImage(logoDer.base64, 'PNG', 15, 5, logoDerWidth, logoDerHeight);
  doc.addImage(logoIzq.base64, 'PNG', pageWidth - logoIzqWidth - 9, 2, logoIzqWidth, logoIzqHeight);

  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('UNIVERSIDAD NACIONAL AUTÓNOMA DE HONDURAS', pageWidth / 2, 33, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Listado de usuarios', 14, 43);

  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${fechaStr}`, 14, 49);

  // Tabla usuarios
  autoTable(doc, {
    startY: 53,
    head: [['Nombre', 'Correo', 'Número', 'Unidad Académica', 'Estado', 'Fecha Vencimiento']],
    body: this.usuarios.map(u => [
      u.nombre || 'No proporcionado',
      u.correo || 'No proporcionado',
      u.numeroEmpleado || 'No proporcionado',
      u.nombreUnidadAcademica || 'No proporcionado',
      u.estadoUsuario || 'No proporcionado',
      u.fechaVencimiento ? new Date(u.fechaVencimiento).toLocaleString('es-HN', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      }) : 'No proporcionado'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 102], textColor: 255, halign: 'center' },
    bodyStyles: { fontSize: 10, valign: 'top' },
    styles: { cellPadding: 3 }
  });

  // Paginación
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Guardar PDF
  doc.save(nombreArchivo);
}



}
