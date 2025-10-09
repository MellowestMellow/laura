// Angular Core
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

// Angular Forms
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  FormBuilder,
  FormArray
} from '@angular/forms';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { AngularImports } from '../../../../angular.imports';
import { PrimeNGImports } from '../../../../primeng.imports';

// Servicios - Seguridad
import { AuthService } from '../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../servicios/seguridad/acceso/permiso/permiso.service';

// Servicios - Comisiones
import { ComisionService } from '../../../servicios/comision/comision.service';
import { LayoutService } from '../../../servicios/diseno/layout/layout.service';

@Component({
  selector: 'app-comision',
  imports: [PrimeNGImports, AngularImports],
  templateUrl: './comision.component.html',
  styleUrl: './comision.component.scss',
  providers: [MessageService],
})

export class ComisionComponent implements OnInit {
 @Output() loadingCompleted = new EventEmitter<boolean>();

 
  IntegranteSubComisionForm!: FormGroup;
  readonly ROL_COORDINADOR = 11;

  searchValue: string | undefined;
  loadingComisionId: number | null = null;

  nombreSubComision: string = '';
  estadoSubComision: string = '';
  estadoSubComisionTemp: number = 0;

  nombreComision: string = '';
  estadoComision: string = '';
  estadoComisionTemp: number = 0;

  idSubComisionSeleccionado: any = null;
  nombreSubComisionSeleccionado: string = '';

  integrantesNuevos: any[] = [];
  visibleActualizarIntegrante: boolean = false;
  addIntegrante: boolean = false;

  comision: any[] = [];
  solicitudes: any[] = [];
  integrantes: any[] = [];
  usuario: any[] = [];
  usuariosTotales: any[] = [];
  usuariosDisponibles: any[] = [];

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  loadingtable: boolean = false;
  isLoadingIntegrante: boolean = false;
  isLoadingComision: boolean = false;
  isLoadingSubComision: boolean = false;
  loadingIntegrantes: { [idComision: number]: boolean } = {};

  loadingDialogGeneral: boolean = false;
  loadingDialogComision: boolean = false;
  loadingDialogSubComision: boolean = false;
  loadingDialogIntegrante: boolean = false;
  loadingActualizarIntegrante: boolean = false;

  visibleEstadoComision: boolean = false;
  visibleIntegrante: boolean = false;
  visibleEstadoSubComision: boolean = false;


  ComisionForm = new FormGroup({
    idComision: new FormControl('', Validators.required),
    idEstadoComision: new FormControl(''),
    nombreEstadoComision: new FormControl(''),
  });


  SubComisionForm = new FormGroup({
    idSubComision: new FormControl('', Validators.required),
    idEstadoSubComision: new FormControl(''),
    nombreEstadoSubComision: new FormControl(''),
  });


  IntegrantesForm = new FormGroup({
    idSubComision: new FormControl('', Validators.required),
    nombreSubComision: new FormControl(''),
  });

  ActualizarIntegrantesForm = new FormGroup({
    idSubComision: new FormControl('', Validators.required),
    idSolicitud: new FormControl('', Validators.required)
  });

  permisoOptions = [
    { idRol: 12, rol: 'Editor de Documento' },
    { idRol: 13, rol: 'Lector de Documento' }
  ];

  rolOptions = [
    { idRol: 11, rol: 'Coordinador de la Subcomisión Curricular' },
    { idRol: 18, rol: 'Miembro de la Subcomisión Curricular' }
  ];

  constructor(
    private messageService: MessageService, // Inyección de MessageService
    private ComisionService: ComisionService,
    private fb: FormBuilder,
    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private layoutService: LayoutService
  ) { this.initializeIntegrantes(); }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────

  ngOnInit(): void {
    this.layoutService.setHeader('Mis Solicitudes');
    this.loadingtable = true;
    this.cargarComision();
    this.cargarSelects();
    this.obtenerPermisos();
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 16; // El objeto que estás consultando

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

  // Métodos para mostrar los distintos diálogos (Registrar, Modificar, Inactivar, Roles)
  showDialog(dialogType: 'EstadoSubComision' | 'Integrante' | 'EstadoComision') {
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



  mostrarActualizacion() {
    console.log({ ActualizarIntegrantesForm: this.ActualizarIntegrantesForm.value });
    this.loadingActualizarIntegrante = true;
    // Aquí tu lógica de actualización
    this.cargarDatosIntegrantes(); // Cambiar a true para mostrar el segundo formulario
    //console.log({visibleActualizarIntegrante: this.visibleActualizarIntegrante}); 
  }

  onCloseModal() {
    // Cuando el modal se cierra, restablece el estado de visibilidad
    this.visibleActualizarIntegrante = false;
    this.IntegrantesForm.reset();
    this.integrante.clear();  // Limpiar el FormArray de integrantes
  }

  cargarSelects(): void {
    this.ComisionService.getUsuarioSubComision().subscribe(
      (response: any) => {
        this.usuariosTotales = response;
      },
      (error) => {
        console.error('Error al obtener la información', error);
      }
    );
  }

  // ────────────────────────────────
  // Sección de Carga de Datos para Tablas
  // Métodos para obtener solicitudes estratégicas, curriculares y administrativas
  // Manejo de carga, filtrado y errores
  // ─

  getUsuariosDisponibles(row: AbstractControl) {
    const idSeleccionado = row.get('idUsuario')?.value;

    // Incluye los disponibles + el que tiene seleccionado actualmente
    const disponibles = this.usuariosTotales.filter(usuario => {
      return !this.integrante.controls.some(control =>
        control !== row && control.get('idUsuario')?.value === usuario.idUsuario
      );
    });

    return disponibles;
  }


  cargarComision(): void {
    this.loadingtable = true;  // Mostrar un estado de carga al inicio
    this.ComisionService.getComision().subscribe(
      (response: any) => {
        this.comision = response.map((comision: any, index: number) => ({
          numero: index + 1, // Agregar un número consecutivo manualmente
          ...comision,
          fechaVencimiento: new Date(comision.fechaVencimiento), // Asegúrate de convertir la fecha
        }));
        this.loadingtable = false; // Datos cargados con éxito
         this.loadingCompleted.emit(true);
      },
      (error) => {
        this.loadingtable = false;  // Detener el estado de carga
         this.loadingCompleted.emit(true);
        this.showErrorMessage(error.error.mensaje);  // Mostrar mensaje de error (puedes mejorar la visualización)
      }
    );
  }


  cargarDatos(comision: any, tipo: 'EstadoComision' | 'EstadoSubComision' | 'Integrante'): void {
    this.loadingDialogGeneral = true;
    this.loadingComisionId = comision.idSubComision;

    this.idSubComisionSeleccionado = comision.idSubComision;
    this.nombreSubComisionSeleccionado = comision.nombreSubComision;
    //console.log({visibleActualizarIntegrante: this.visibleActualizarIntegrante}); 

    if (tipo === 'Integrante') {
      // Aquí cargarías los integrantes
      this.loadingDialogIntegrante = true;

      this.ComisionService.getIntegrantes(comision.idSubComision, null).subscribe(
        (response: any) => {
          this.integrantes = response.map((integrante: any, index: number) => {
            const roles = JSON.parse(integrante.roles || '[]');

            const permisoObj = roles.find((r: any) => r.idRol === 12 || r.idRol === 13);
            const rolObj = roles.find((r: any) => r.idRol === 11 || r.idRol === 18);

            this.nombreSubComision = comision.nombreSubComision;
            this.loadingDialogGeneral = false;
            this.loadingDialogIntegrante = false;
            this.visibleIntegrante = true;
            this.loadingComisionId = null;

            setTimeout(() => {
              this.showDialog(tipo);
            }, 0);

            return {
              numero: index + 1,
              ...integrante,
              fechaVencimiento: new Date(integrante.fechaVencimiento),
              permiso: permisoObj?.idRol || null,
              rol: rolObj?.idRol || null,
              nombrepermiso: permisoObj?.rol || null,
              nombreRol: rolObj?.rol || null
            };
          })
        },
        (error) => {
          this.loadingComisionId = null;
          this.loadingDialogGeneral = false;
          this.loadingDialogIntegrante = false;
          this.showErrorMessage(error.error.mensaje);
        }
      );

      // Asigna el idSubComision al formulario de Actualizar Integrantes
      this.ActualizarIntegrantesForm.patchValue({
        idSubComision: this.idSubComisionSeleccionado
      });

    } else {
      // Cargar datos de Comision/Subcomision
      if (tipo === 'EstadoComision') {
        this.loadingDialogComision = true;
        this.loadingDialogSubComision = false;
      } else {
        this.loadingDialogComision = false;
        this.loadingDialogSubComision = true;
      }

      this.loadingComisionId = null;
      this.nombreComision = comision.nombreComision;
      this.estadoComision = comision.nombreEstadoComision;
      this.estadoComisionTemp = comision.idEstadoComision;

      this.nombreSubComision = comision.nombreSubComision;
      this.estadoSubComision = comision.nombreEstadoSubComision;
      this.estadoSubComisionTemp = comision.idEstadoSubComision;

      this.SubComisionForm.patchValue({
        idSubComision: comision.idSubComision,
        idEstadoSubComision: comision.idEstadoSubComision.toString(),
        nombreEstadoSubComision: comision.nombreEstadoSubComision,
      });

      this.ComisionForm.patchValue({
        idComision: comision.idComision,
        idEstadoComision: comision.idEstadoComision.toString(),
        nombreEstadoComision: comision.nombreEstadoComision,
      });

      setTimeout(() => {
        this.loadingDialogGeneral = false;
        this.loadingDialogComision = false;
        this.loadingDialogSubComision = false;
        this.loadingDialogIntegrante = false;

        setTimeout(() => {
          this.showDialog(tipo);
        }, 0);
      }, 300);
    }
  }

  cargarDatosIntegrantes(): void {
    //console.log({visibleActualizarIntegrante: this.visibleActualizarIntegrante}); 
    this.loadingIntegrantes[this.idSubComisionSeleccionado] = true; // Mostrar el spinner al iniciar la carga
    this.nombreSubComision = this.nombreSubComisionSeleccionado;

    // Rellenar los valores iniciales del formulario
    this.IntegrantesForm.patchValue({
      idSubComision: this.idSubComisionSeleccionado,
      nombreSubComision: this.nombreSubComisionSeleccionado,
    });

    //console.log({Integrantes : this.integrantes});
    this.integrantes.forEach((integrante: any) => {
      const integrantesGroup = this.fb.group({
        primerNombre: [integrante.primerNombre || '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(25)
          ]
        }
        ],
        segundoNombre: [integrante.segundoNombre || '',
        {
          validators: [
            Validators.maxLength(25)
          ]
        }
        ],
        primerApellido: [integrante.primerApellido || '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(25)
          ]
        }
        ],
        segundoApellido: [integrante.segundoApellido || '',
        {
          validators: [
            Validators.maxLength(25)
          ]
        }
        ],
        correo: [integrante.correo || '',
        {
          validators: [
            Validators.required,
            Validators.pattern(/^[a-zA-ZñÑ0-9._%+-]+@(unah\.edu\.hn|unah\.hn)$/),
            Validators.email,
            Validators.maxLength(100),
          ]
        }
        ],
        numEmpleado: [integrante.numEmpleado || '',
        {
          validators: [
            Validators.required
          ]
        }
        ],
        telefonos: [integrante.telefonos || '',
        {
          validators: [
            Validators.required,
            Validators.pattern(/^\d+$/),
          ]
        }
        ],
        permiso: [integrante.permiso || '',
        {
          validators: [
            Validators.required
          ]
        }
        ],
        rol: [integrante.rol || '',
        {
          validators: [
            Validators.required
          ]
        }
        ]
      });
      this.integrante.push(integrantesGroup);  // Agregar al FormArray de relaciones

      //console.log({ Integrantes: this.integrante});
      this.loadingIntegrantes[this.idSubComisionSeleccionado] = false;
    });

    this.ComisionService.getSolicitudesPorSubComision(+this.idSubComisionSeleccionado).subscribe(
      (response: any) => {
        this.solicitudes = response;

        this.loadingActualizarIntegrante = false;
        this.visibleActualizarIntegrante = true;
      },
      (error) => {
        this.loadingActualizarIntegrante = false;
        this.showErrorMessage(error.error.mensaje);
      }
    );
  }

  onRolChange(event: any, rowIndex: number): void {
    const rolSeleccionado = +event.value;

    const yaHayCoordinador =
      this.integrante.controls.some((control, index) =>
        index !== rowIndex && control.get('rol')?.value === this.ROL_COORDINADOR
      );

    if (rolSeleccionado === this.ROL_COORDINADOR && yaHayCoordinador) {
      // Revertir la selección del rol
      this.integrante.at(rowIndex).get('rol')?.setValue(null);

      // Mostrar mensaje al usuario
      this.messageService.add({
        severity: 'warn',
        summary: 'Rol no permitido',
        detail: 'Solo puede haber un Coordinador de la Subcomisión Curricular',
        life: 7000
      });
    }
  }



  initializeIntegrantes() {
    this.IntegranteSubComisionForm = this.fb.group({
      integrante: this.fb.array([])
    });
  }

  get integrante(): FormArray {
    return this.IntegranteSubComisionForm.get('integrante') as FormArray;
  }

  // Método para agregar filas a las tablas de formación, redes, integrante y líneas de investigación
  addRow() {
    const IntegranteGroup = this.fb.group({
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      correo: ['', Validators.required],
      numEmpleado: ['', Validators.required],
      telefonos: [''],
      rol: ['', Validators.required],
      permiso: ['', Validators.required],
    });
    this.integrante.push(IntegranteGroup);
  }

  removeRow(index: number): void {
    this.integrante.removeAt(index);
  }

  // Método para manejar el cambio de estado
  cambiarEstadoComision(): void {
    // Cambiar el estado temporal dependiendo de si es 1 o 2
    if (this.estadoComisionTemp === 1) {
      this.estadoComisionTemp = 2;  // Cambiar a Inactivo
      this.estadoComision = 'Inactivo';
    } else if (this.estadoComisionTemp === 2) {
      this.estadoComisionTemp = 1;  // Cambiar a Activo
      this.estadoComision = 'Activo';
    }

    // Actualizar el formulario con el nuevo estado
    this.ComisionForm.patchValue({
      idEstadoComision: this.estadoComisionTemp.toString(),  // Convertir de nuevo a string para el formulario
      nombreEstadoComision: this.estadoComision,
    });

    // Mostrar los datos que se envían en el log (esto es solo para debug)
    //console.log('Datos que se envían para actualizar la comisión:', this.ComisionForm.value);
  }

  cambiarEstadoSubomision(): void {
    // Cambiar el estado temporal dependiendo de si es 1 o 2
    if (this.estadoSubComisionTemp === 1) {
      this.estadoSubComisionTemp = 2;  // Cambiar a Inactivo
      this.estadoSubComision = 'Inactivo';
    } else if (this.estadoSubComisionTemp === 2) {
      this.estadoSubComisionTemp = 1;  // Cambiar a Activo
      this.estadoSubComision = 'Activo';
    }

    // Actualizar el formulario con el nuevo estado
    this.SubComisionForm.patchValue({
      idEstadoSubComision: this.estadoSubComisionTemp.toString(),  // Convertir de nuevo a string para el formulario
      nombreEstadoSubComision: this.estadoSubComision,
    });

    // Mostrar los datos que se envían en el log (esto es solo para debug)
    //console.log('Datos que se envían para actualizar la comisión:', this.ComisionForm.value);
  }

  actualizarEstadoComision(): void {
    this.isLoadingComision = true;
    const formdata = this.ComisionForm.value;

    // Aquí verificamos si el estado es correcto antes de enviar
    if (formdata.idEstadoComision === '1' && formdata.nombreEstadoComision === 'Activo') {
      // Invertir los valores
      formdata.idEstadoComision = '2';
      formdata.nombreEstadoComision = 'Inactivo';
    } else if (formdata.idEstadoComision === '2' && formdata.nombreEstadoComision === 'Inactivo') {
      // Invertir los valores
      formdata.idEstadoComision = '1';
      formdata.nombreEstadoComision = 'Activo';
    }

    // Mostrar los datos que se envían después de la corrección
    //console.log('Datos corregidos que se envían para actualizar la comisión:', formdata);

    // Llamar al servicio para actualizar la comisión con el nuevo estado
    this.ComisionService.putEstadoComision(formdata).subscribe(
      (res: any) => {
        this.cargarComision();
        this.ComisionForm.reset();
        this.visibleEstadoComision = false;
        this.isLoadingComision = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Estado de la Comisión actualizada exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingComision = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el estado de la comisión';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarEstadoSubComision(): void {
    this.isLoadingSubComision = true;
    const formdata = this.SubComisionForm.value;

    // Aquí verificamos si el estado es correcto antes de enviar
    if (formdata.idEstadoSubComision === '1' && formdata.nombreEstadoSubComision === 'Activo') {
      // Invertir los valores
      formdata.idEstadoSubComision = '2';
      formdata.nombreEstadoSubComision = 'Inactivo';
    } else if (formdata.idEstadoSubComision === '2' && formdata.nombreEstadoSubComision === 'Inactivo') {
      // Invertir los valores
      formdata.idEstadoSubComision = '1';
      formdata.nombreEstadoSubComision = 'Activo';
    }

    // Mostrar los datos que se envían después de la corrección
    //console.log('Datos corregidos que se envían para actualizar la comisión:', formdata);

    // Llamar al servicio para actualizar la comisión con el nuevo estado
    this.ComisionService.putEstadoSubComision(formdata).subscribe(
      (res: any) => {
        this.cargarComision();
        this.SubComisionForm.reset();
        this.visibleEstadoSubComision = false;
        this.isLoadingSubComision = false;

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Estado de la Subcomisión actualizada exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingSubComision = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al actualizar el estado de la Subcomisión';
        this.messageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  actualizarIntegrantes(): void {
    this.isLoadingIntegrante = true;
    const formData = this.ActualizarIntegrantesForm.value;

    let IntegrantesJSON = '';
    if (this.integrante.value.length > 0) {
      IntegrantesJSON = JSON.stringify(this.integrante.value);
    } else {
      const msg = 'Los integrantes son requeridos.';
      this.messageService.add({
        severity: 'error',
        summary: 'Operación Fallida',
        detail: msg,
        life: 3000
      });
      this.isLoadingIntegrante = false;
      return; // No sigas si no hay datos
    }

    const data = {
      ...formData,
      integrantes: IntegrantesJSON,
    };

    console.log({ data: data });
    this.ComisionService.putIntegrantes(data).subscribe(
      () => {
        // 1. Actualizar la tabla principal
        this.cargarDatos({ idSubComision: formData.idSubComision, nombreSubComision: this.nombreSubComision }, 'Integrante');

        // 2. Mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'Los integrantes de la subcomisión han sido actualizados.',
          life: 4000
        });

        // 3. Cuando el mensaje termine 
        setTimeout(() => {
          // 3.1. Limpiar el formulario pero reasignar valores necesarios
          this.ActualizarIntegrantesForm.patchValue({
            idSolicitud: null
          });

          this.IntegranteSubComisionForm.reset();
          this.integrante.reset();

          // 3.2. Marcar como "pristine" para que no esté "touched"
          this.IntegrantesForm.markAsPristine();
          this.IntegrantesForm.markAsUntouched();


          // 3.3. Ocultar el formulario de actualización
          this.visibleActualizarIntegrante = false;
          this.isLoadingIntegrante = false;
        })

      },
      (error: any) => {
        this.isLoadingIntegrante = false;
        const msg = error.error?.mensaje || 'Error al actualizar los integrantes';
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
