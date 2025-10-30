// Angular Core
import {
  Component,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Angular Forms
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';

// Librerías externas
import { MessageService } from 'primeng/api';
import { Stepper } from 'primeng/stepper';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { PermisoService } from '../../../../servicios/seguridad/acceso/permiso/permiso.service';
import { LoginService } from '../../../../servicios/seguridad/cuenta/login/login.service';
import { PerfilService } from '../../../../servicios/seguridad/cuenta/perfil/perfil.service';

// Servicios - Mantenimiento
import { MantenimientoEstadoUsuarioService } from '../../../../servicios/mantenimiento/seguridad/estado-usuario/mantenimiento-estado-usuario.service';
import { MantenimientoGeneroService } from '../../../../servicios/mantenimiento/persona/genero/mantenimiento-genero.service';
import { LayoutService } from '../../../../servicios/diseno/layout/layout.service';

@Component({
  selector: 'app-perfil',
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})

export class PerfilComponent {

  @ViewChild(Stepper) stepper!: Stepper;
  @Output() loadingCompleted = new EventEmitter<boolean>();

  estadoUsuario: any[] = [];
  genero: any[] = [];

  nombreUsuario: string | null = null; // Variable para almacenar el nombre del usuario

  permisoActualizar: boolean = false;
  permisoInsertar: boolean = false;
  permisoEliminar: boolean = false;

  correoOculto: boolean = false;
  botonesHabilitados: boolean = false;
  modoEdicion: boolean = false;
  codigoEnviado: boolean = false;
  mostrarOtp: boolean = false;
  otpVerificado: boolean = false;
  loadingtable: boolean = false;

  isLoadingActualizar: boolean = false;
  isLoadingAutenticar: boolean = false;
  isLoadingOTP: boolean = false;
  isLoadingContrasena: boolean = false;
  visibleActualizar: boolean = false;

  correo: string = '';
  contrasena: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  codigoOtp: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';


  nuevaContrasenaValida: boolean = true;
  nuevaContrasenaLargo: boolean = true;
  nuevaContrasenaMayuscula: boolean = true;
  nuevaContrasenaNumero: boolean = true;
  nuevaContrasenaEspecial: boolean = true;

  confirmarNuevaContrasenaLargo: boolean = true;
  confirmarNuevaContrasenaMayuscula: boolean = true;
  confirmarNuevaContrasenaNumero: boolean = true;
  confirmarNuevaContrasenaEspecial: boolean = true;
  passwordTouched: boolean = false;
  confirmPasswordTouched: boolean = false;

  activeStep: number = 1;

  ActualizarForm = new FormGroup({
    primerNombre: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+$')]),
    segundoNombre: new FormControl({ value: '', disabled: true }, [
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+)?$/)
    ]),
    primerApellido: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+$')]),
    segundoApellido: new FormControl({ value: '', disabled: true }, [
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ]+)?$/)
    ]),
    idGenero: new FormControl({ value: '', disabled: true }, Validators.required),
    correo: new FormControl({ value: '', disabled: true }, [Validators.required, this.validarCorreoUnah]), // Este sí va habilitado al principio
    telefonoCelular: new FormControl({ value: '', disabled: true }, Validators.required),
    telefonoAlterno: new FormControl({ value: '', disabled: true }),
    numEmpleado: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]+$/)]),
  });

  constructor(

    private AuthService: AuthService,
    private PermisoService: PermisoService,
    private GeneroService: MantenimientoGeneroService,
    private EstadoUsuarioService: MantenimientoEstadoUsuarioService,
    private PerfilService: PerfilService,
    private MessageService: MessageService,
    private LoginService: LoginService,
    private Router: Router,
    private layoutService: LayoutService
  ) {
  }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit() {
    this.cargarSelects();
    this.nombreUsuario = this.AuthService.getNombreUsuario();
    this.CargarPerfil();
    this.loadingtable = true;
    this.layoutService.setHeader('Perfil');
  }

  originalFormValue: any;

  habilitarCampos() {
    this.modoEdicion = true;
    this.correoOculto = true;

    // Guardar valores originales para restaurar si se cancela
    this.originalFormValue = this.ActualizarForm.getRawValue();

    Object.keys(this.ActualizarForm.controls).forEach(controlName => {
      if (controlName !== 'correo') {
        this.ActualizarForm.get(controlName)?.enable();
      } else {
        this.ActualizarForm.get(controlName)?.disable();
      }
    });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.correoOculto = false;

    // Resetear con los valores originales para descartar cambios
    this.ActualizarForm.reset(this.originalFormValue);

    Object.keys(this.ActualizarForm.controls).forEach(controlName => {
      this.ActualizarForm.get(controlName)?.disable();
    });

    // Opcional: marcar como pristine y untouched para que no muestre errores
    this.ActualizarForm.markAsPristine();
    this.ActualizarForm.markAsUntouched();
  }

  showDialog(dialogType: 'Actualizar') {
    this[`visible${dialogType}`] = true;
  }

  obtenerPermisos(): void {
    const roles = this.AuthService.getRolesFromToken() ?? [];
    const idObjeto = 2; // El objeto que estás consultando

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

  validarContrasena() {
    this.nuevaContrasenaLargo = this.nuevaContrasena.length < 8;
    this.nuevaContrasenaMayuscula = !/[A-Z]/.test(this.nuevaContrasena);
    this.nuevaContrasenaNumero = !/[0-9]/.test(this.nuevaContrasena);
    this.nuevaContrasenaEspecial = !/^[^=><]*[!@#$%^&*(),.?":{}|<>_\-\/\\][^=><]*$/.test(this.nuevaContrasena);
    this.passwordTouched = true; // Mark the password field as touched
  }

  validarContrasenas() {
    this.confirmarNuevaContrasenaLargo = this.confirmarContrasena.length < 8;
    this.confirmarNuevaContrasenaMayuscula = !/[A-Z]/.test(this.confirmarContrasena);
    this.confirmarNuevaContrasenaNumero = !/[0-9]/.test(this.confirmarContrasena);
    this.confirmarNuevaContrasenaEspecial = !/^[^=><]*[!@#$%^&*,.?":{}|<>_\-\/\\][^=><]*$/.test(this.confirmarContrasena);
    this.confirmPasswordTouched = true; // Mark the confirm password field as touched
  }

  validarCorreoUnah(control: AbstractControl): ValidationErrors | null {
    const correo = control.value;
    if (!correo) return null;

    // Solo permitimos correos que terminen en @unah.hn o @unah.edu.hn
    const pattern = /^[\w-.]+@(unah\.hn|unah\.edu\.hn)$/i;
    return pattern.test(correo) ? null : { dominioInvalido: true };
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

  }

  CargarPerfil() {
    this.PerfilService.getPersonaPerfil().subscribe(
      (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const perfil = data[0];

          this.ActualizarForm.patchValue({
            primerNombre: perfil.primerNombre || 'No proporcionado',
            segundoNombre: perfil.segundoNombre || 'No proporcionado',
            primerApellido: perfil.primerApellido || 'No proporcionado',
            segundoApellido: perfil.segundoApellido || 'No proporcionado',
            idGenero: perfil.idGenero || 'No proporcionado',
            correo: perfil.correo || 'No proporcionado',
            telefonoCelular: perfil.telefonoCelular || 'No proporcionado',
            telefonoAlterno: perfil.telefonoAlterno || 'No proporcionado',
            numEmpleado: perfil.numEmpleado || 'No proporcionado',
          });
          this.loadingtable = false;
          this.loadingCompleted.emit(true);


        } else {
          //console.warn('No se recibió un perfil válido:', data);
          this.loadingtable = false;
          this.loadingCompleted.emit(true);

        }
      },
      (error) => {
        //console.error('Error al obtener perfil', error);
        this.loadingtable = false;
      }
    );
  }


  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // Verificacion de OTP, y Cambio de Contraseña, etc
  // ────────────────────────────────
  actualizarPerfil() {
    this.isLoadingActualizar = true;
    const formdata = this.ActualizarForm.value;

    this.PerfilService.putPerfilPersona(formdata).subscribe(
      (res: any) => {
        const mensaje = Array.isArray(res) && res.length > 0 ? res[0].mensaje : 'Credenciales del perfil actualizadas exitosamente';

        this.CargarPerfil();
        this.isLoadingActualizar = false;
        this.MessageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: mensaje,
          life: 3000
        });
        this.modoEdicion = false;
        this.correoOculto = false;

        Object.keys(this.ActualizarForm.controls).forEach(controlName => {
          this.ActualizarForm.get(controlName)?.disable();
        });
      },
      (error: any) => {
        this.isLoadingActualizar = false;
        const msg = error.error?.mensaje || 'Error al actualizar las credenciales del perfil ';
        this.MessageService.add({
          severity: 'error',
          summary: 'Operación Fallida',
          detail: msg,
          life: 3000
        });
      }
    );
  }

  autenticarPerfil(activateCallback: Function) {
    if (!this.correo) {
      this.errorMessage = 'Por favor, ingrese su correo para solicitar el código OTP.';
      return;
    }

    if (!this.contrasena) {
      this.errorMessage = 'Por favor, ingrese su contraseña para autenticarlo.';
      return;
    }

    const contrasenaCifrada = this.LoginService.encriptar(this.contrasena);
    this.isLoadingAutenticar = true;

    this.AuthService.postAutenticarPerfil(this.correo, contrasenaCifrada).subscribe({
      next: (response) => {
        this.isLoadingAutenticar = false;
        if (response && response.success) {
          this.successMessage = 'Código enviado al correo proporcionado.';
          this.codigoEnviado = true;
          this.MessageService.add({
            icon: 'pi pi-check',
            severity: 'success',
            summary: 'Operación Exitosa',
            detail: 'Usuario verificado correctamente. Se ha enviado un código al correo.',
            life: 3000
          });

          // ✅ Llamada directa al callback proporcionado por p-step-panel
          setTimeout(() => {
            this.mostrarOtp = true;
            activateCallback(2); // Aquí se invoca directamente
          }, 0);
        } else {
          this.MessageService.add({
            icon: 'pi pi-times',
            severity: 'error',
            summary: 'Operación Fallida',
            detail: response.mensaje || 'Error al enviar el código. Intente nuevamente.',
            life: 3000
          });
          this.MessageService.add({
            severity: 'warn',
            summary: 'Recordatorio',
            detail: 'El correo y contraseña deben corresponder al usuario que inició sesión.',
            life: 5000
          });
        }
      },
      error: (err) => {
        this.isLoadingAutenticar = false;
        this.MessageService.add({
          icon: 'pi pi-times',
          severity: 'error',
          summary: 'Operación Fallida',
          detail: err.mensaje || 'Error al enviar el código. Intente nuevamente.',
          life: 3000
        });
      }
    });
  }

  onVerifyOtp(activateCallback: Function) {
    // Validar que el campo no esté vacío
    if (!this.codigoOtp) {
      this.errorMessage = 'Por favor, ingrese un código OTP.';
      return; // Salir si el código está vacío
    }

    // Validar que el código OTP sea un número de 6 dígitos
    const otpPattern = /^[0-9]{6}$/;
    if (!otpPattern.test(this.codigoOtp)) {
      this.errorMessage = 'El código OTP debe ser un número de 6 dígitos.';
      return; // Salir si el formato no es válido
    }

    this.isLoadingOTP = true; // Activar el indicador de carga

    this.AuthService.postVerificarOTP(this.codigoOtp, this.correo).subscribe({
      next: (response) => {
        this.isLoadingOTP = false; // Detener el indicador de carga

        if (response.success) {
          // Si la verificación es exitosa
          this.successMessage = 'Código verificado correctamente.';
          this.otpVerificado = true;
          this.mostrarOtp = false;
          this.MessageService.add({
            icon: 'pi pi-check',
            severity: 'success',
            summary: 'Operación Exitosa',
            detail: 'Código verificado correctamente.',
            life: 3000
          });

          // Emitir el callback para avanzar al siguiente paso
          setTimeout(() => {
            this.mostrarOtp = true;
            activateCallback(3); // Aquí se invoca directamente
          }, 0);
        }
      },
      error: (err) => {
        this.isLoadingOTP = false; // Detener el indicador de carga

        const errorMessage = err.error?.message || 'Error en la verificación del código. Intente nuevamente.';

        if (errorMessage === 'El código ha expirado o ha sido bloqueado. Se le ha enviado un nuevo codigo a su dirección de correo electrónico.') {
          this.MessageService.add({
            icon: 'pi pi-exclamation-triangle',
            severity: 'warn',
            summary: 'Operación Fallida',
            detail: errorMessage,
            life: 7000
          });
        } else {
          this.MessageService.add({
            icon: 'pi pi-times',
            severity: 'error',
            summary: 'Operación Fallida',
            detail: errorMessage,
            life: 5000
          });
        }
      }
    });
  }

  onCambiarContrasena() {
    // Verificar que las contraseñas coincidan
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }
    ////console.log('Correo, codigo',this.correo,this.codigoOtp);
    // Validar que se tenga correo y código OTP
    if (!this.correo || !this.codigoOtp) {
      this.errorMessage = 'Correo o código OTP no están definidos.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }

    this.isLoadingContrasena = true;
    // Encriptar la nueva contraseña
    const contrasenaEncriptada = this.LoginService.encriptar(this.nuevaContrasena);

    // Llamar al servicio con correo, código OTP y la contraseña encriptada
    this.AuthService.postActualizarContrasena(this.correo, this.codigoOtp, contrasenaEncriptada).subscribe({
      next: () => {
        this.isLoadingContrasena = false;
        this.MessageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'La contraseña se ha actualizado con éxito.',
          life: 50000
        });

        this.MessageService.add({
          severity: 'info',
          summary: 'Atención',
          detail: 'Se cerrará tu sesión en breve, por favor inicia sesión nuevamente con tu nueva contraseña.',
          life: 5000
        });

        setTimeout(() => {
          this.AuthService.logouts();
          this.Router.navigate(['/menu']);
        }, 5000);

        this.visibleActualizar = false
      },
      error: (err) => {
        this.isLoadingContrasena = false;
        const mensajeError = err.error?.mensaje || 'Error al cambiar la contraseña. Intente nuevamente.';
        this.MessageService.add({
          icon: 'pi pi-times',
          severity: 'error',
          summary: 'Operación Fallida',
          detail: mensajeError,
          life: 3000
        });
      }
    });
  }


}
