// Angular Core
import { Component, ViewChild } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Angular Forms
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';

// Librerías externas
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Estructura Académica
import { EstructuraAcademicaService } from '../../../../servicios/estructura-academica/estructura-academica.service';

// Servicios - Seguridad
import { PerfilService } from '../../../../servicios/seguridad/cuenta/perfil/perfil.service';

// Servicios - Solicitud
import { TicketService } from '../../../../servicios/solicitud/ticket/ticket.service';

// Servicios - Comisiones
import { ComisionService } from '../../../../servicios/comision/comision.service';

// Componentes
import { HeaderPanelComponent } from '../../../diseno/header/header-panel/header-panel.component';

@Component({
  selector: 'app-registro-tickets',
  imports: [PrimeNGImports, AngularImports, HeaderPanelComponent],
  providers: [MessageService],
  templateUrl: './registro-tickets.component.html',
  styleUrl: './registro-tickets.component.scss',
})
export class RegistroTicketsComponent {
  @ViewChild('categoriaSel') categoriaSel!: any;
  @ViewChild('fileUploader') fileUploader!: FileUpload;

  validarCorreoUnah(control: AbstractControl): ValidationErrors | null {
    const correo = control.value;
    if (!correo) return null;

    // Solo permitimos correos que terminen en @unah.hn o @unah.edu.hn
    const pattern = /^[\w-.]+@(?:unah\.edu\.hn|unah\.hn)$/i;
    return pattern.test(correo) ? null : { dominioInvalido: true };
  }

  regresarPanel() {
    this.router.navigate(['/panel']);
  }

  RegistrarForm: FormGroup;
  ReservacionForm!: FormGroup;

  calendarReady = false;

  isCategoriaSeleccionada: boolean = false;
  archivoSubido = false;
  loadingintegrantes = false;

  disenio: boolean = false;
  redisenio: boolean = false;
  ampliacion: boolean = false;
  isEmailValid: boolean = false;
  visibleCarrera: boolean = false;
  visibleIdCarrera: boolean = false;
  visibleFacultad: boolean = false;
  visibleDepartamento: boolean = false;
  visibleReservacion: boolean = false;
  visibleEstrategicoAcademico: boolean = false;
  visibleCurricular: boolean = false;
  visibleAgregarIntegrante: boolean = false;
  registrarReservacion: boolean = false;

  tipoSolictiud: number = 0;
  campusId: number = 0;
  facultadId: number = 0;
  carreraId: number = 0;
  categoriaSeccionada: number = 0; // Para comparaciones lógicas


  categoriaSeleccionadaNombre: string = ''; // Para mostrar el nombre en pantalla
  carreras: string = '';
  nombreCampus: string = '';

  campus: any[] = [];
  universidades: any[] = [];
  gradosAcademicos: any[] = [];
  integrantesSubComision: any[] = [];
  facultad: any[] = [];
  departamento: any[] = [];
  carrera: any[] = [];
  categoriaTicket: any[] = [];
  tipoSolicitud: any[] = [];
  categoriaTicketFiltrada: any[] = [];

  isLoadingRegistrarTicket: boolean = false;
  tipoSolicitudSeleccionadaId: number | null = null;
  mostrarInputCarrera: boolean = false;
  selectedCampus: any = null;

  // Variables para nombre de persona solicitante
  primerNombre: string = '';
  segundoNombre: string = '';
  primerApellido: string = '';
  segundoApellido: string = '';

  //Variables para funcionalidad de archivos
  selectedFiles: File[] = [];
  nombresArchivos: string[] = [];
  fileUploaded: boolean = false;
  rutas: { nombreOriginal: string; key: string }[] = [];
  Bucket: string = '';
  Location: string = '';
  loading: boolean = false;
  integrantesCargados: boolean = false;
  verDialogoTerminos: boolean = false;

  calendarVal?: Date;
  readonly ROL_COORDINADOR = 11;
  readonly ROL_MIEMBRO = 18;
  readonly PERMISO_EDITOR = 12;
  readonly PERMISO_LECTOR = 13;

  // Array para almacenar correos de integrantes de sub-comisión
  emails: any[] = [];
  emailForm: FormGroup = new FormGroup({
    emails: new FormControl([], Validators.required)
  });

  // Array para almacenar nombres de integrantes de sub-comisión
  nombres: any[] = [];
  nombreForm: FormGroup = new FormGroup({
    nombres: new FormControl([], Validators.required)
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
    public fb: FormBuilder,
    private router: Router,
    private perfilService: PerfilService,
    private EstructuraAcademicaService: EstructuraAcademicaService,
    private TicketService: TicketService,
    private MessageService: MessageService,
    private ComisionService: ComisionService
  ) {
    this.RegistrarForm = this.fb.group({
      idCategoria: ['', Validators.required],
      idTipoSolicitud: ['', Validators.required],
      correo: [null, [Validators.required, Validators.maxLength(100), Validators.email]],
      tipoSolicitud: [''],
      //TIcket Curricular 
      idCampus: [''],
      nombreCampus: [''],
      idDepartamento: [''],
      idFacultad: [''],
      facultad: [''],
      institucion: [''],
      esInstitucional: [''],
      idUniversidad: [''],
      idGrado: [''],
      carrera: ['', [Validators.maxLength(250), Validators.minLength(10), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
      idTituloAcademico: [''],
      idCampusTituloAcademico: [''],
      integrantesSubComision: [null],
      integrantes: this.fb.array([]),
      aceptaTerminos: [false]  // Para validar que el checkbox esté marcado
    });
  }

  ngOnInit() {
    this.cargarSelects();

    this.ReservacionForm = this.fb.group({
      idCategoria: ['', Validators.required],
      correo: [null, [Validators.required, Validators.maxLength(100), Validators.email]],
      nombre: [null, [Validators.required, Validators.maxLength(100)]],
      idTipoSolicitud: ['', Validators.required],
      tipoSolicitud: ['', Validators.required],
      responsable: [null, [Validators.required, Validators.maxLength(100)]],
      actividad: [null, [Validators.required, Validators.maxLength(100)]],
      fecha: [null, [Validators.required]],
      inicio: [null, [Validators.required]],
      fin: [null, [Validators.required]],
      cantidadPersonas: [null, [Validators.required]]
    });

    setTimeout(() => {
      this.calendarReady = true;
    });
  }

  esBotonEnviarDeshabilitado(): boolean {
    if (+this.RegistrarForm.get('idTipoSolicitud')!.value === 5) {
      this.integrantesCargados = true;
    }

    const requiereIntegrantes = this.categoriaSeccionada === 2 && this.isEmailValid;
    return this.RegistrarForm.invalid ||
      this.isLoadingRegistrarTicket ||
      !this.archivoSubido ||
      (requiereIntegrantes ? !this.integrantesCargados : false);
  }

  getTipoTickets(esCorreoInstitucional: boolean, categoria: number): void {
    //console.log({esCorreoInstitucional: esCorreoInstitucional});
    if (categoria === 2) {
      this.TicketService.getTipoSolicitud(categoria).subscribe({
        next: (data: any) => {
          this.tipoSolicitud = esCorreoInstitucional
            ? data
            : data.filter((item: any) => [5, 6].includes(item.idTipoSolicitud));

          this.isEmailValid = esCorreoInstitucional;
          this.filtrarCategorias();
          //console.log('Tipos de ticket filtrados:', this.tipoSolicitud);
        },
        error: (error: any) => {
          //console.error('Error al cargar tipos de ticket:', error);
        }
      });
    } else {
      this.TicketService.getTipoSolicitud(categoria).subscribe({
        next: (data: any) => {
          this.tipoSolicitud = data;

          this.isEmailValid = esCorreoInstitucional;
          this.filtrarCategorias();
          //console.log('Tipos de ticket filtrados:', this.tipoSolicitud);
        },
        error: (error: any) => {
          //console.error('Error al cargar tipos de ticket:', error);
        }
      });
    }
  }

  filtrarCategorias(): void {
    if (this.isEmailValid === true) {
      this.categoriaTicketFiltrada = this.categoriaTicket;
    } else {
      // 1) Aplica el filtro sobre el array original:
      this.categoriaTicketFiltrada = this.isEmailValid
        ? [...this.categoriaTicket]
        : this.categoriaTicket.filter(c => [1, 2].includes(c.idCategoriaTipoSolicitud));

      // 2) Fuerza a PrimeNG a resetear el input de búsqueda:
      if (this.categoriaSel) {
        this.categoriaSel.resetFilter();
      }

      // 3) Si la selección actual ya no existe, resetea el control:
      const sel = this.RegistrarForm.get('idCategoria')?.value;
      if (sel != null && !this.categoriaTicketFiltrada.some(c => c.idCategoriaTipoSolicitud === sel)) {
        this.RegistrarForm.get('idCategoria')?.reset();
      }
    }
  }

  resetearFormulario() {
    // Reestablecer validaciones originales del formulario de registro
    this.RegistrarForm = this.fb.group({
      idCategoria: ['', Validators.required],
      idTipoSolicitud: ['', Validators.required],
      correo: [null, [Validators.required, Validators.maxLength(100), Validators.email]],
      tipoSolicitud: ['', Validators.required],
      //TIcket Curricular 
      idCampus: [''],
      nombreCampus: [''],
      idDepartamento: [''],
      idFacultad: [''],
      facultad: [''],
      institucion: [''],
      esInstitucional: [''],
      idUniversidad: [''],
      idGrado: [''],
      carrera: ['', [Validators.maxLength(250), Validators.minLength(10), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
      idTituloAcademico: [''],
      idCampusTituloAcademico: [''],
      integrantesSubComision: [null],
      integrantes: this.fb.array([]),
      aceptaTerminos: false
    });


    // Resetear variables
    this.loading = false;
    this.categoriaSeccionada = 0;
    this.isCategoriaSeleccionada = false;
    this.tipoSolicitudSeleccionadaId = null;
    this.loading = false;
    this.fileUploaded = false;
    this.isLoadingRegistrarTicket = false;
    this.mostrarInputCarrera = false;
    this.selectedCampus = null;
    this.disenio = false;
    this.ampliacion = false;
    this.redisenio = false;
    this.isEmailValid = false;
    this.visibleCarrera = false;
    this.visibleIdCarrera = false;
    this.visibleFacultad = false;
    this.visibleDepartamento = false;
    this.visibleEstrategicoAcademico = false;
    this.visibleAgregarIntegrante = false;
    this.visibleCurricular = false;
    this.visibleReservacion = false;
    this.tipoSolictiud = 0;
    this.campusId = 0;
    this.facultadId = 0;
    this.carreraId = 0;
    this.carreras = '';
    this.nombreCampus = '';
    this.selectedFiles = [];
    this.integrantesSubComision = []
    this.archivoSubido = false; // Asegúrate de resetear la bandera también

    this.isLoadingRegistrarTicket = false;

    this.integrantes.clear(); // Limpiar el FormArray de integrantes

    this.nombresArchivos = [];
    (this.Location = ''), (this.rutas = []), (this.Bucket = '');
  }


  onSelectCategoria(event: any) {
    this.markFormGroupUntouched(this.RegistrarForm);
    this.markFormGroupUntouched(this.ReservacionForm);

    // Limpiar archivos seleccionados cuando se cambia de ticket
    this.selectedFiles = [];
    this.tipoSolicitud = [];
    this.archivoSubido = false; // Resetear la bandera de archivo subido

    // Si seleccionan la opción falsa (cargando), la limpiamos inmediatamente
    if (+event.value === -1) {
      //this.RegistrarForm.get('idCategoria')?.reset();
      this.RegistrarForm.patchValue({
        idCategoria: null,
      });
    }

    // Selección normal
    const categoria = this.categoriaTicket.find(
      (categoria) => categoria.idCategoriaTipoSolicitud === event.value
    );

    //console.log({categoria: categoria, eventValue: event.value});

    if (categoria) {
      this.categoriaSeccionada = categoria.idCategoriaTipoSolicitud;
      this.categoriaSeleccionadaNombre = categoria.categoriaTipoSolicitud;
      this.isCategoriaSeleccionada = true;

      /*console.log({categoriaSeccionada: this.categoriaSeccionada, 
        NombrecategoriaSeccionada: this.categoriaSeleccionadaNombre});*/
    }

    if (this.categoriaSeccionada !== 3) {
      this.visibleReservacion = false;
      this.RegistrarForm.patchValue({
        tipoSolicitud: '',
        idTipoSolicitud: null,
      });
    }

    this.getTipoTickets(this.isEmailValid, this.categoriaSeccionada);

    this.actualizarValidaciones();
  }

  confirmarTipoTicket(): void {
    const categoria = this.RegistrarForm.get('idCategoria')?.value;
    //console.log({categoria: categoria});

    const carrera = this.RegistrarForm.get('carrera')?.value;

    //console.log({carrera : carrera});

    console.log({ 'IntegrantesArray': this.integrantes.value });
    console.log({ 'IntegrantesSubComision': this.integrantesSubComision });

    const carreraExistente = this.carrera.find(c => c.nombreTituloAcademico === carrera);

    if (carreraExistente && this.tipoSolicitudSeleccionadaId === 5) {
      // Mostrar mensaje de advertencia
      this.MessageService.add({
        severity: 'warn',
        summary: 'No se puede enviar el ticket',
        detail: `No se puede realizar el diseño para la "${carrera}", porque esta carrera ya existe.`,
        life: 7000
      });
      return;
    }

    if (categoria === 1 || categoria === 4) {
      this.visibleEstrategicoAcademico = true;
      this.registrarReservacion = false;
      this.visibleCurricular = false
    } else if (categoria === 2) {
      this.registrarReservacion = false;
      this.visibleEstrategicoAcademico = false;

      if (this.isEmailValid) {
        //console.log('Correo institucional válido, mostrando formulario curricular');

        const correo = this.RegistrarForm.get('correo')?.value;

        const hayCoordinadorEnIntegrantes = this.integrantes.value.some(
          (integrante: any) => integrante.miembroRol === this.ROL_COORDINADOR
        );
        
        let hayCoordinador = this.hayCoordinadorEnSubComision();
        if (this.integrantesSubComision.length > 0 || this.integrantes.value.length > 0) {
          if ((this.integrantes.value.some((integrante: any) => integrante.miembroCorreo === correo) || this.integrantesSubComision.find((integrante: any) => integrante.correo === correo))) {
            // Validar que exista en coordinador para la comision Curriculra
            if (!hayCoordinadorEnIntegrantes && !hayCoordinador) {
              this.MessageService.add({
                severity: 'error',
                summary: 'No se puede enviar el ticket',
                detail: 'El coordinador de la sub comisión es obligatorio.',
                life: 7000
              });
            } else {
              //console.log('Correo encontrado en integrantes, mostrando formulario curricular');
              this.visibleCurricular = true;
            }
          } else {
            // Mostrar mensaje de advertencia
            this.MessageService.add({
              severity: 'warn',
              summary: 'No se puede enviar el ticket',
              detail: 'La persona solicitante debe ser parte de la subcomisión curricular.',
              life: 7000
            });
          }
        } else {
          this.MessageService.add({
            severity: 'error',
            summary: 'No se puede enviar el ticket',
            detail: 'Los integrantes de la sub comisión son obligatorios.',
            life: 7000
          });
        }
      } else {
        this.visibleCurricular = true;
      }
    }
  }

  private hayCoordinadorEnSubComision(): boolean {
    return this.integrantesSubComision.some((integrante: any) => {
      try {
        const roles = JSON.parse(integrante.roles);
        return roles.some((r: any) => r.idRol === this.ROL_COORDINADOR);
      } catch (e) {
        console.error('Error al parsear roles:', integrante.roles);
        return false;
      }
    });
  }

  confirmarReservacion(): void {
    this.registrarReservacion = true;
    this.visibleCurricular = false;
    this.visibleEstrategicoAcademico = false;
  }

  cargarSelects(): void {
    //Cargar estados de usuario
    this.EstructuraAcademicaService.getCampus().subscribe(
      (response: any) => {
        this.campus = response;
      },
      (error) => {
        //console.error('Error al obtener la información', error);
      }
    );
  }

  getUniversidadesYGrados(): void {
    this.EstructuraAcademicaService.getUniversidad().subscribe(
      (response: any) => {
        this.universidades = response.result || [];

        //console.log({universidades: this.universidades});
      },
      (error) => {
        //console.error('Error al obtener la información de universidades : ', error);
      }
    );

    this.EstructuraAcademicaService.getGradoAcademico().subscribe(
      (response: any) => {
        this.gradosAcademicos = response.result || [];

        //console.log({gradosAcademicos: this.gradosAcademicos});
      },
      (error) => {
        //console.error('Error al obtener la información de grados académicos : ', error);
      }
    );
  }

  getCategoriaTicket(): void {
    const control = this.RegistrarForm.get('correo');
    const resultado = this.validarCorreoUnah(control!);

    this.isEmailValid = resultado === null;

    //console.log({isEmailValid: this.isEmailValid});

    this.TicketService.getCategoriaSolicitud().subscribe(
      (response: any) => {
        this.categoriaTicket = response.result;;
        //console.log('Categorias: ', this.categoriaTicket);

        if (this.isEmailValid === true) {
          this.categoriaTicketFiltrada = this.categoriaTicket;
        } else {
          // 1) Aplica tu filtro sobre el array original:
          this.categoriaTicketFiltrada = this.categoriaTicket.filter(c => [1, 2].includes(c.idCategoriaTipoSolicitud));

          // 2) Fuerza a PrimeNG a resetear el input de búsqueda:
          if (this.categoriaSel) {
            this.categoriaSel.resetFilter();
          }

          // 3) Si la selección actual ya no existe, resetea el control:
          const sel = this.RegistrarForm.get('idCategoria')?.value;
          if (sel != null && !this.categoriaTicketFiltrada.some(c => c.idCategoriaTipoSolicitud === sel)) {
            this.RegistrarForm.get('idCategoria')?.reset();
          }
        }
      },
      (error) => {
        //console.error('Error al obtener la información de las categorías', error);
      }
    );

    const correo = this.RegistrarForm.get('correo')?.value;

    this.perfilService.getNombreUsuario(correo).subscribe(
      (response: any) => {
        this.primerNombre = response[0].primerNombre || '';
        this.segundoNombre = response[0].segundoNombre || '';
        this.primerApellido = response[0].primerApellido || '';
        this.segundoApellido = response[0].segundoApellido || '';

        console.log('Nombre de usuario obtenido:', response);
      },
      (error) => {
        console.error('Error al obtener el nombre de usuario', error);
      }
    );
  }

  getIntegrantesYSubComision(idCampusTituloAcademico: number): void {
    this.loadingintegrantes = true;
    this.ComisionService.getInfoSubcomision(idCampusTituloAcademico).subscribe(
      (response: any) => {
        this.integrantesSubComision = response.map((integrante: any) => {
          const roles = JSON.parse(integrante.roles || '[]');

          const permisoObj = roles.find((r: any) => r.idRol === this.PERMISO_EDITOR || r.idRol === this);
          const rolObj = roles.find((r: any) => r.idRol === this.ROL_COORDINADOR || r.idRol === this.ROL_MIEMBRO);

          return {
            ...integrante,
            permiso: permisoObj?.idRol || null,
            rol: rolObj?.idRol || null,
            nombrepermiso: permisoObj?.rol || null,
            nombreRol: rolObj?.rol || null
          };
        });

        this.integrantesCargados = true;
        this.loadingintegrantes = false;
        //console.log({ integrantesSubComision: this.integrantesSubComision });
        // Agregar integrante al formArray si correo no existe en el formArray
        const correo = this.RegistrarForm.get('correo')?.value;

        console.log({integrantesSubComision: this.integrantesSubComision});

        let hayCoordinador = this.hayCoordinadorEnSubComision();

        console.log({hayCoordinador: hayCoordinador});

        if ([5, 6, 10].includes(this.tipoSolicitudSeleccionadaId!) && this.isEmailValid) {
          if(hayCoordinador) {
            this.cargarIntegranteAlArray(correo, this.ROL_MIEMBRO);
          } else {
            this.cargarIntegranteAlArray(correo, this.ROL_COORDINADOR);
          }
        }
      },
      (error) => {
        this.loadingintegrantes = false;
        //console.error('Error al obtener los integrantes de la subcomisión:', error);
      }
    );

  }

  cargarIntegranteAlArray(correo: string, rol: number): void {
    if (!this.integrantes.value.some((integrante: any) => integrante.miembroCorreo === correo)) {
      const miembroGroup = this.fb.group({
        miembroprimerNombre: [this.primerNombre, [Validators.required, Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
        miembrosegundoNombre: [this.segundoNombre, [Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
        miembroprimerApellido: [this.primerApellido, [Validators.required, Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
        miembrosegundoApellido: [this.segundoApellido, [Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
        miembroCorreo: [correo, [Validators.required, Validators.pattern(/^[a-zA-ZñÑ0-9._%+-]+@(unah\.edu\.hn|unah\.hn)$/), Validators.maxLength(100)]],
        miembroNumEmpleado: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^\d+$/)]],
        miembroTelefono: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^\d+$/)]],
        miembroRol: [rol, Validators.required],
        permiso: [this.PERMISO_EDITOR, Validators.required]
        });
      this.integrantes.push(miembroGroup);
    }
  }

  cargarCarreras(idCampus: number, idFacultad: number): void {
    if (idFacultad === 0) {
      // Si no se ha seleccionado facultad, cargamos carreras para la facultad predeterminada (1)
      this.EstructuraAcademicaService.getTituloAcademico({ idCampus, idFacultad: 1 }).subscribe({
        next: (data: any) => {
          this.carrera = data;
          //console.log('Carreras cargadas sin facultad:', this.carreras);
        },
        error: (error: any) => {
          //console.error('Error al cargar carreras sin facultad:', error);
        }
      });
    } else {
      // Si hay facultad seleccionada, cargamos las carreras correspondientes
      this.EstructuraAcademicaService.getTituloAcademico({ idCampus, idFacultad }).subscribe({
        next: (data: any) => {
          this.carrera = data;
          //console.log('Carreras cargadas para la facultad:', this.carreras);
        },
        error: (error: any) => {
          //console.error('Error al cargar carreras para la facultad:', error);
        }
      });
    }
  }

  getTitulosAcademicos(): void {
    this.EstructuraAcademicaService.getTodosLosTituloAcademico().subscribe({
      next: (data: any) => {
        this.carrera = data;
      },
      error: (error: any) => {
        //console.error('Error al cargar títulos académicos:', error);
      }
    });
  }


  onTipoSolicitudChange(event: any) {
    this.integrantes.clear();
    const selectedId = Number(event.value);

    this.tipoSolicitudSeleccionadaId = selectedId;
    console.log({ tipoSolicitudSeleccionadaId: this.tipoSolicitudSeleccionadaId })

    if (selectedId === 5) {
      this.disenio = true;
      this.ampliacion = false;
      this.redisenio = false;
    }

    if (selectedId === 6) {
      this.redisenio = true;
      this.disenio = false;
      this.ampliacion = false;
    }

    if (selectedId === 10) {
      this.ampliacion = true;
      this.disenio = false;
      this.redisenio = false;
    }

    if (![5, 6, 10].includes(selectedId)) {
      this.disenio = false;
      this.redisenio = false;
      this.ampliacion = false;
    }

    this.carrera = [];
    this.carreraId = 0;
    this.integrantesCargados = false;
    this.integrantesSubComision = [];

    const selectedSolicitud = this.tipoSolicitud.find(
      (solicitud) => solicitud.idTipoSolicitud === event.value
    );

    if (selectedSolicitud) {
      this.RegistrarForm.patchValue({
        tipoSolicitud: selectedSolicitud.tipoSolicitud,
      });
    }

    if (selectedId === 2) {
      this.visibleReservacion = true;
      this.ReservacionForm.patchValue({
        idTipoSolicitud: selectedId,
        tipoSolicitud: selectedSolicitud.tipoSolicitud,
        correo: this.RegistrarForm.get('correo')?.value,
        idCategoria: this.RegistrarForm.get('idCategoria')?.value
      });
    } else {
      this.ReservacionForm.reset();
      this.visibleReservacion = false;
    }

    if ([5, 6].includes(this.tipoSolicitudSeleccionadaId)) {
      this.getUniversidadesYGrados();
    }

    this.actualizarValidaciones();
  }

  onCampusChange(event: any): void {
    this.visibleDepartamento = true;
    this.selectedCampus = event.value;
    this.campusId = event.value;
    // Reiniciar valores y arreglos relacionados
    this.RegistrarForm.patchValue({ idFacultad: null, idDepartamento: null, idCampusTituloAcademico: null });

    this.facultad = [];
    this.departamento = [];
    this.carrera = [];

    //console.log('Campus seleccionado:', this.campusId);

    const selectedCampus = this.campus.find(
      (campus) => campus.idCampus === this.campusId
    );

    if (selectedCampus) {
      this.RegistrarForm.patchValue({
        nombreCampus: selectedCampus.nombreCampus
      });
    }

    // Cargar facultades según el campus seleccionado
    if (this.campusId === 1) {
      this.visibleFacultad = true;
      this.EstructuraAcademicaService.getFacultad(this.campusId).subscribe({
        next: (data: any) => {
          this.facultad = data;
        },
        error: (error: any) => {
          //console.error('Error al cargar facultades:', error);
        }
      });
    } else {
      this.visibleFacultad = false;
      this.EstructuraAcademicaService.getDepartamento({ idCampus: this.campusId, idFacultad: 1 }).subscribe({
        next: (data: any) => {
          this.departamento = data;
        },
        error: (error: any) => {
          //console.error('Error al cargar departamentos:', error);
        }
      });
    }
    // Cargar carreras para rediseño
    if ([6].includes(this.tipoSolicitudSeleccionadaId!)) {
      this.cargarCarreras(this.campusId, this.facultadId);
    }

    const correo = this.RegistrarForm.get('correo')?.value;

    // Marcar integrantes como cargados para diseño curricular
    if ([5].includes(this.tipoSolicitudSeleccionadaId!)) {
      //this.integrantesCargados = true;
      this.cargarIntegranteAlArray(correo, this.ROL_COORDINADOR);
    }
    // Cargar todas las carreras para ampliación curricular
    if ([5, 10].includes(this.tipoSolicitudSeleccionadaId!)) {
      this.getTitulosAcademicos();
    }
  }

  onFacultadChange(event: any): void {
    this.facultadId = event.value;
    //console.log('Facultad seleccionada:', this.facultadId);
    // Reiniciar departamentos y carreras
    this.RegistrarForm.patchValue({ idDepartamento: null, idCampusTituloAcademico: null });
    this.departamento = [];
    this.carrera = [];

    const selectedFacultad = this.facultad.find(
      (facultad) => facultad.idFacultad === this.facultadId
    );

    if (selectedFacultad) {
      this.RegistrarForm.patchValue({
        facultad: selectedFacultad.nombreFacultad
      });
    }

    if (this.campusId === 1 && this.facultadId) {
      // Cargar departamentos
      this.EstructuraAcademicaService.getDepartamento({ idCampus: this.campusId, idFacultad: this.facultadId }).subscribe({
        next: (data: any) => {
          this.departamento = data;
        },
        error: (error: any) => {
          //console.error('Error al cargar departamentos:', error);
        }
      });
    } else {
      this.EstructuraAcademicaService.getDepartamento({ idCampus: this.campusId, idFacultad: 1 }).subscribe({
        next: (data: any) => {
          this.departamento = data;
        },
        error: (error: any) => {
          //console.error('Error al cargar departamentos:', error);
        }
      });
    }

    // Cargar carreras para diseño y rediseño
    if ([6].includes(this.tipoSolicitudSeleccionadaId!)) {
      this.cargarCarreras(this.campusId, this.facultadId);
    }

    // Cargar todas las carreras para ampliación curricular y diseño curricular
    if ([5, 10].includes(this.tipoSolicitudSeleccionadaId!)) {
      this.getTitulosAcademicos();
    }

  }

  onCarreraSelect(event: any): void {
    this.carreraId = event.value;  // El valor del select

    let selectedCarrera;

    // Asignar nombre a carrera seleccionada según el tipo de solicitud
    if (this.tipoSolicitudSeleccionadaId === 10) { // Ampliación Curricular
      selectedCarrera = this.carrera.find(c => c.idTituloAcademico === this.carreraId);
    }

    if (this.tipoSolicitudSeleccionadaId === 6) { // Rediseño Curricular
      selectedCarrera = this.carrera.find(c => c.idCampusTituloAcademico === this.carreraId);
    }

    if (selectedCarrera) {
      this.RegistrarForm.patchValue({
        carrera: selectedCarrera.nombreTituloAcademico
      });
    }

    this.getIntegrantesYSubComision(this.carreraId);
  }

  onRolChange(event: any, rowIndex: number): void {
    const rolSeleccionado = event.value;

    const yaHayCoordinador =
      this.integrantesSubComision.some((i: any) => i.rol === this.ROL_COORDINADOR) ||
      this.integrantes.controls.some((control, index) =>
        index !== rowIndex && control.get('miembroRol')?.value === this.ROL_COORDINADOR
      );

    if (rolSeleccionado === this.ROL_COORDINADOR && yaHayCoordinador) {
      // Revertir la selección del rol
      this.integrantes.at(rowIndex).get('miembroRol')?.setValue(null);

      // Mostrar mensaje al usuario
      this.MessageService.add({
        severity: 'warn',
        summary: 'Rol no permitido',
        detail: 'Solo puede haber un Coordinador de la Subcomisión Curricular',
        life: 7000
      });
    }
  }

  get integrantes(): FormArray {
    return this.RegistrarForm.get('integrantes') as FormArray;
  }

  agregarMiembro(): void {
    this.visibleAgregarIntegrante = true;

    const miembroGroup = this.fb.group({
      miembroprimerNombre: ['', [Validators.required, Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
      miembrosegundoNombre: ['', [Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
      miembroprimerApellido: ['', [Validators.required, Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
      miembrosegundoApellido: ['', [Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/), this.noInyeccionSQL]],
      miembroCorreo: ['', [Validators.required, Validators.pattern(/^[a-zA-ZñÑ0-9._%+-]+@(unah\.edu\.hn|unah\.hn)$/), Validators.maxLength(100)]],
      miembroNumEmpleado: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^\d+$/)]],
      miembroTelefono: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^\d+$/)]],
      miembroRol: [null, Validators.required],
      permiso: [null, Validators.required]
    });
    this.integrantes.push(miembroGroup);

    //console.log({ visibleAgregarIntegrante: this.visibleAgregarIntegrante });
  }

  eliminarMiembro(tabla: number, index: number): void {
    if (tabla === 1) {
      this.integrantesSubComision.splice(index, 1); // Eliminar el miembro del array de integrantesSubComision
    } else {
      this.integrantes.removeAt(index); // Eliminar el miembro del array de integrantesSubComision
    }
  }

  getfiles(event: any): void {
    const files = Array.from(event.files) as File[];
    if (files.length === 0) {
      this.archivoSubido = false;
      return;
    }
    this.selectedFiles = files;
    this.nombresArchivos = this.selectedFiles.map((file) => file.name);
    this.archivoSubido = true; // Se marca como subido
    this.sendfiles();
  }

  sendfiles(): void {
    this.loading = true;
    this.fileUploaded = false;
    let filesProcessed = 0;
    const totalFiles = this.selectedFiles.length;
    this.selectedFiles.forEach((file, index) => {
      const formData = new FormData();
      formData.append('image', file);

    });
  }

  removeFile(event: any): void {
    const fileToRemove = event.file.name;
    this.loading = false;
    // Filtramos el archivo removido del array
    this.selectedFiles = this.selectedFiles.filter(
      (file) => file !== fileToRemove
    );
    // Eliminar la ruta correspondiente del archivo
    this.rutas = this.rutas.filter(
      (item) => item.nombreOriginal !== fileToRemove
    );
  }

  // Métodos para registrar tickets
  ingresarTicketEstrategicoAdministrativa() {
    this.isLoadingRegistrarTicket = true;
    const formdata = this.RegistrarForm.value;

    const formDatas = new FormData();
    this.selectedFiles.forEach(file => {
      formDatas.append('image', file, file.name);
    });

    // Agregar campos del formulario
    for (const key in formdata) {
      if (formdata.hasOwnProperty(key)) {
        formDatas.append(key, formdata[key]);
      }
    }

    if (this.isEmailValid === false) {
      this.RegistrarForm.patchValue({
        esInstitucional: 0,
      });
    } else {
      this.RegistrarForm.patchValue({
        esInstitucional: 1,
      });
    }

    // Llamar al servicio para insertar usuario y persona
    this.TicketService.postTicket(formDatas).subscribe(
      (res: any) => {
        this.actualizarValidaciones();
        this.resetearFormulario();
        this.RegistrarForm.patchValue({
          aceptaTerminos: false
        });
        // Mostrar mensaje de éxito
        this.MessageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Ticket registrado exitosamente',
          life: 3000
        });
      },
      (error: any) => {
        this.isLoadingRegistrarTicket = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el ticket';
        this.MessageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });

        this.RegistrarForm.patchValue({
          aceptaTerminos: false
        });
      }
    );
  }

  // Método para registrar tickets curriculares
  ingresarTicketCurricular() {
    this.isLoadingRegistrarTicket = true;

    if (this.isEmailValid === false) {
      this.RegistrarForm.patchValue({
        esInstitucional: 0,
      });
    } else {
      this.RegistrarForm.patchValue({
        esInstitucional: 1,
      });
    }

    if (this.integrantesSubComision.length > 0) {
      this.integrantesSubComision.forEach(integrante => {
        const miembroGroup = this.fb.group({
          miembroprimerNombre: integrante.primerNombre,
          miembrosegundoNombre: integrante.segundoNombre,
          miembroprimerApellido: integrante.primerApellido,
          miembrosegundoApellido: integrante.segundoApellido,
          miembroCorreo: integrante.correo,
          miembroNumEmpleado: integrante.numEmpleado,
          miembroTelefono: '',
          miembroRol: integrante.rol,
          permiso: integrante.permiso
        });
        this.integrantes.push(miembroGroup);
      });
    }

    //console.log({ integrantes: this.integrantes.value });
    //console.log({ integrantesSubComision: this.integrantesSubComision });

    const miembros = this.integrantes.value;
    const miembrosJSON = JSON.stringify(miembros);  // Conviértelo solo una vez

    const formDatas = new FormData();
    this.selectedFiles.forEach(file => {
      formDatas.append('image', file, file.name);
    });

    this.integrantesSubComision = [];
    // Agregar campos del formulario
    const formDataValues = this.RegistrarForm.value;

    for (const key in formDataValues) {
      if (formDataValues.hasOwnProperty(key)) {
        if (key === 'integrantesSubComision') {
          formDatas.append(key, miembrosJSON); // Aquí aseguramos que se manda el JSON string bien formateado
        } else {
          if (formDataValues.hasOwnProperty(key) && key !== 'integrantes') {
            formDatas.append(key, formDataValues[key]);
          }
        }
      }
    }

    if (this.RegistrarForm.get('idUniversidad')?.value === '') {
      this.RegistrarForm.patchValue({
        idUniversidad: 1,
      });
    }

    //console.log({ formDatas: formDatas });
    //console.log({ formDataValues: formDataValues });
    // Llamar al servicio para insertar usuario y persona

    this.TicketService.postTicketCurricular(formDatas).subscribe(
      (res: any) => {
        this.actualizarValidaciones();
        this.resetearFormulario();
        this.RegistrarForm.patchValue({
          aceptaTerminos: false
        });
        this.isLoadingRegistrarTicket = false;
        // Mostrar mensaje de éxito
        this.MessageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Ticket registrado exitosamente',
          life: 7000
        });
      },
      (error: any) => {
        this.isLoadingRegistrarTicket = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el ticket';
        this.MessageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 7000
        });

        this.RegistrarForm.patchValue({
          aceptaTerminos: false
        });
      }
    );
  }

  ingresarTicketReservacion() {
    //this.isLoadingRegistrarTicket = true;
    const formData = this.ReservacionForm.value;

    const horaInicio = this.ReservacionForm.get('inicio')?.value as Date;
    const horaFinal = this.ReservacionForm.get('fin')?.value as Date;

    // Ajusta la hora local eliminando la diferencia del timezone
    const horaLocalInicio = new Date(horaInicio.getTime() - (horaInicio.getTimezoneOffset() * 60000));
    const horaLocalFinal = new Date(horaFinal.getTime() - (horaFinal.getTimezoneOffset() * 60000));

    this.ReservacionForm.patchValue({
      horaInicio: horaLocalInicio.toISOString().slice(11, 19), // Formato HH:mm:ss  
      horaFin: horaLocalFinal.toISOString().slice(11, 19) // Formato HH:mm:ss
    });
    //console.log({ formulario: this.ReservacionForm.value });

    let data = {
      ...formData,
      horaInicio: horaLocalInicio.toISOString().slice(11, 19), // Formato HH:mm:ss  
      horaFin: horaLocalFinal.toISOString().slice(11, 19) // Formato HH:mm:ss
    }

    //console.log({ data: data });
    // Llamar al servicio para insertar usuario y persona
    this.TicketService.postTicketReservacion(data).subscribe(
      (res: any) => {
        this.ReservacionForm.reset();
        this.RegistrarForm.reset();
        this.RegistrarForm.patchValue({
          aceptaTerminos: false
        });
        // Mostrar mensaje de éxito
        this.MessageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: res.message || 'Ticket registrado exitosamente',
          life: 3000
        });

        this.isLoadingRegistrarTicket = false;
        this.visibleReservacion = false;
        this.categoriaSeccionada = -1;
      },
      (error: any) => {
        this.isLoadingRegistrarTicket = false;
        // Mostrar mensaje de error
        const msg = error.error?.mensaje || 'Error al registrar el ticket';
        this.MessageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }
  // Validación para evitar inyección SQL
  private noInyeccionSQL(control: AbstractControl): ValidationErrors | null {
    const valor = control.value?.toLowerCase();
    if (!valor) return null;

    const patronesProhibidos = [
      'select ', 'insert ', 'update ', 'delete ',
      'drop ', 'alter ', 'create ', '--', ';', '/*', '*/',
      'exec ', 'union ', 'truncate ', 'shutdown '
    ];

    for (const patron of patronesProhibidos) {
      if (valor.includes(patron)) {
        return { inyeccionSQL: true };
      }
    }

    return null;
  }

  private actualizarValidaciones(): void {
    this.loading = false;
    this.fileUploaded = false;
    this.selectedFiles = [];
    this.archivoSubido = false;
    this.nombresArchivos = [];

    const correo = this.RegistrarForm.get('correo')?.value;
    const idCategoria = this.RegistrarForm.get('idCategoria')?.value;
    const idTipoSolicitud = this.RegistrarForm.get('idTipoSolicitud')?.value;
    const tipoSolicitud = this.RegistrarForm.get('tipoSolicitud')?.value;

    this.RegistrarForm.reset({
      correo: correo,
      idCategoria: idCategoria,
      idTipoSolicitud: this.tipoSolicitudSeleccionadaId,
      tipoSolicitud: tipoSolicitud,
      aceptaTerminos: false  // Si quieres reiniciar el checkbox también
    });

    (this.Location = ''), (this.rutas = []), (this.Bucket = '');
    if (this.fileUploader && this.fileUploader.files.length > 0) {
      this.fileUploader.clear();
    }

    //console.log({tipoSolicitudSeleccionadaId: this.tipoSolicitudSeleccionadaId});

    const universidadCtrl = this.RegistrarForm.get('idUniversidad');
    const gradoCtrl = this.RegistrarForm.get('idGrado');
    const carreraCtrl = this.RegistrarForm.get('carrera');
    const idTituloAcademicoCtrl = this.RegistrarForm.get('idTituloAcademico');
    const idCampusTituloAcademicoCtrl = this.RegistrarForm.get('idCampusTituloAcademico');
    const departamentoCtrl = this.RegistrarForm.get('idDepartamento');
    const campusCtrl = this.RegistrarForm.get('idCampus');
    const institucionCtrl = this.RegistrarForm.get('institucion');

    // Actualizar validaciones anteriores para mejorar gestion del RegistrarForm.invalid
    universidadCtrl?.clearValidators();
    gradoCtrl?.clearValidators();
    carreraCtrl?.clearValidators();
    idTituloAcademicoCtrl?.clearValidators();
    idCampusTituloAcademicoCtrl?.clearValidators();
    departamentoCtrl?.clearValidators();
    campusCtrl?.clearValidators();
    institucionCtrl?.clearValidators();

    const debeValidarExterno = this.isEmailValid === false && idCategoria === 2;
    const debeValidarInterno = this.isEmailValid === true && idCategoria === 2;
    const debeValidarEstrategica = idCategoria === 1;
    const debeValidarAdmin = idCategoria === 4;
    const debeValidarRediseno = debeValidarInterno === true && [6].includes(this.tipoSolicitudSeleccionadaId!);
    const debeValidarAmpliacion = debeValidarInterno === true && [10].includes(this.tipoSolicitudSeleccionadaId!);
    const debeValidarDisenio = idCategoria === 2 && [5].includes(this.tipoSolicitudSeleccionadaId!);

    console.log({ debeValidarInterno: debeValidarInterno });

    if (debeValidarExterno) {
      universidadCtrl?.setValidators([
        Validators.required
      ]);
    }

    if (debeValidarInterno) {
      campusCtrl?.setValidators([
        Validators.required
      ]);

      departamentoCtrl?.setValidators([
        Validators.required
      ]);
    }

    if (debeValidarAdmin) {
      campusCtrl?.setValidators([
        Validators.required
      ]);
    }

    if (debeValidarRediseno) {
      idCampusTituloAcademicoCtrl?.setValidators([
        Validators.required
      ]);
    }

    if (debeValidarAmpliacion) {
      idTituloAcademicoCtrl?.setValidators([  // Ampliación curricular
        Validators.required
      ]);
    }

    if (debeValidarExterno || debeValidarDisenio) {
      carreraCtrl?.setValidators([
        Validators.required,
        Validators.maxLength(250),
        Validators.minLength(10),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
        this.noInyeccionSQL
      ]);
    }

    if (debeValidarEstrategica) {
      institucionCtrl?.setValidators([
        Validators.required,
        Validators.maxLength(250),
        Validators.minLength(2),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s-]+$/),
        this.noInyeccionSQL
      ]);
    }

    universidadCtrl?.updateValueAndValidity();
    gradoCtrl?.updateValueAndValidity();
    carreraCtrl?.updateValueAndValidity();
    idCampusTituloAcademicoCtrl?.updateValueAndValidity();
    idTituloAcademicoCtrl?.updateValueAndValidity();
    departamentoCtrl?.updateValueAndValidity();
    campusCtrl?.updateValueAndValidity();
    institucionCtrl?.updateValueAndValidity();
  }

  private markFormGroupUntouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupUntouched(control); // Recursivo si hay grupos o arrays anidados
      } else {
        control.markAsUntouched();
      }
    });

    formGroup.markAsUntouched(); // También marca el grupo en sí como no tocado
  }
}
