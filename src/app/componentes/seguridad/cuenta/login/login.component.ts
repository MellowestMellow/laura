// Angular Core
import { Component, OnInit } from '@angular/core';

// Angular Router
import { Router } from '@angular/router';

// Angular Forms
import { FormGroup, FormControl, Validators } from '@angular/forms';

// Librerías externas
import { MessageService } from 'primeng/api';

// Módulos compartidos
import { PrimeNGImports } from '../../../../../primeng.imports';
import { AngularImports } from '../../../../../angular.imports';

// Servicios - Seguridad
import { AuthService } from '../../../../servicios/seguridad/acceso/auth/auth.service';
import { LoginService } from '../../../../servicios/seguridad/cuenta/login/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimeNGImports, AngularImports],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  styles: [
    `
      .custom-otp-input {
        width: 40px;
        font-size: 36px;
        border: 0 none;
        appearance: none;
        text-align: center;
        transition: all 0.2s;
        background: transparent;
        border-bottom: 2px solid var(--p-inputtext-border-color);
        border-radius: 0px;
      }

      .custom-otp-input:focus {
        outline: 0 none;
        border-bottom-color: var(--p-primary-color);
      }
    `,
  ],
})

export class LoginComponent implements OnInit {

  correo: string = '';
  contrasena: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  codigoOtp: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  loginImage: string = '';


  loading: boolean = false;
  mostrarOtp: boolean = false;
  verAutoregistro: boolean = false;
  verLogin: boolean = false;
  mostrarAutoregistroInput: boolean = false;
  mostrarAutoregistroInsert: boolean = false;
  visibleRegistrar: boolean = false;
  mostrarOtpInput: boolean = false;
  mostrarResetPassword: boolean = false;
  codigoCorrecto: boolean = false;
  codigoEnviado: boolean = false;

  pasoActual: number = 0;
  idUsuario: number | undefined;

  otpVerificado: boolean = false;
  correoEnviado: boolean = false;

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

  selectedPais: number | null = null; // o undefined dependiendo de tu lógica

  images: any[] = [];

  constructor(
    private router: Router,
    private LoginService: LoginService,
    private AuthService: AuthService,
    private messageService: MessageService // Inyección de MessageService
  ) { }

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────

  ngOnInit(): void {
    this.images = [
      { src: 'Logo Blanco.png', alt: 'Image 1' },
      { src: 'almmt2.jpg', alt: 'Image 2' },
      { src: 'Img2.jpg', alt: 'Image 3' },
      { src: 'Img3.jpg', alt: 'Image 4' },
      { src: 'Img.jpg', alt: 'Image 5' },
      { src: 'Lucem_Aspicio.png', alt: 'Image 1' },
    ];
  }

  passwordResetForm = new FormGroup({
    correo: new FormControl('', [Validators.required, Validators.email])
  });

  // Formulario de verificación OTP
  otpVerificationForm = new FormGroup({
    otp: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]{6}$')])
  });

  // Formulario de verificación OTP
  changePasswordForm = new FormGroup({
    nuevaContrasena: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(6)])
  });

  // ────────────────────────────────
  // Sección de Utilidades Generales
  // Permisos, Filtros, Diálogos y Manejo de Errores
  // ────────────────────────────────
  regresarLogin() {
    this.verAutoregistro = false;
    this.verLogin = false;
    this.mostrarOtp = false;
    this.mostrarResetPassword = false;
    this.otpVerificado = false;
    this.codigoEnviado = false;
    this.limpiarFormulario();
  }

  regresarPanel() {
    this.router.navigate(['/panel']);
    this.limpiarFormulario();
  }

  onOlvidasteContrasena() {
    //this.limpiarFormulario();
    this.mostrarOtp = true;
    this.verAutoregistro = false; // Oculta el formulario de autoregistro
  }

  showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Operación Fallida',
      detail: message,
      life: 3000
    });
  }

  limpiarFormulario() {
    this.otpVerificationForm.reset();
    this.passwordResetForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.codigoOtp = '';
    this.correo = '';
    this.contrasena = '';
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
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

  // ────────────────────────────────
  // Sección de Funciones para Integración con Servicios Backend (APIs)
  // Inicio de Sesion, Verificacion de OTP, y Cambio de Contraseña
  // ────────────────────────────────
onLogin() {
  const contrasenaCifrada = this.LoginService.encriptar(this.contrasena);
  this.loading = true;

  this.AuthService.postLogin(this.correo, contrasenaCifrada).subscribe({
    next: (response) => {
      this.loading = false;

      if (response.mensaje === 'Éxito') {
        if (response.otpRequired) {
          this.codigoEnviado = true;
          this.mostrarOtp = true;
          this.onOlvidasteContrasena(); // Función para enviar el OTP
        } else if (response.token) {
          this.AuthService.setToken(response.token);
          const roles = this.AuthService.getRolesFromToken() ?? [];  

          // Redirecciones según roles
          if (roles.includes(21)) {
            console.log('Roles del usuario dentro del método if:', roles);
            this.router.navigate(['/persona/perfil']);
          } else if (roles.includes(11) || roles.includes(18)) {
            console.log('Roles del usuario con acceso externo:', roles);
            this.router.navigate(['/menu/externo']);
          } else if ([5, 6, 7, 8, 9, 14, 15, 16].some(r => roles.includes(r))) {
            console.log('Roles del usuario con acceso personal:', roles);
            this.router.navigate(['/menu']);
          } else {
            console.log('Roles del usuario dentro del método else:', roles);
            this.router.navigate(['/menu']);
          }

        } else {
          this.showErrorMessage(response.mensaje);  // Mostrar el mensaje de error si no hay token
        }
      } else {
        this.showErrorMessage(response.mensaje);  // Mostrar el mensaje de error
      }
    },
    error: (err) => {
      this.loading = false;

      if (err.error && err.error.mensaje) {
        this.showErrorMessage(err.error.mensaje); // Mensaje desde la BD
      } else {
        this.showErrorMessage('Error en la conexión con el servidor.');
      }
    }
  });
}


  onVerificarCorreo() {
    if (!this.correo) {
      this.errorMessage = 'Por favor, ingrese su correo para solicitar el código OTP.';
      this.messageService.add({
        severity: 'error',
        summary: 'Operación Fallida',
        detail: 'Por favor, ingrese su correo para solicitar el código OTP.',
        life: 3000
      });
      return;
    }

    this.loading = true;

    this.AuthService.postRestablecimientoContraseña(this.correo).subscribe({
      next: (response) => {
        if (response && response.success) {
          // Si la respuesta es exitosa, mostrar el mensaje de éxito
          this.successMessage = 'Código enviado al correo proporcionado.';
          this.messageService.add({
            severity: 'success',
            summary: 'Operación Exitosa',
            detail: 'Código enviado al correo proporcionado.',
            life: 3000
          });
          this.loading = false;
          this.codigoEnviado = true;

          setTimeout(() => {
            this.mostrarOtp = true;  // Habilitar el contenedor OTP
          }, 0);
        } else {
          // Si hubo un error (error: true), muestra el mensaje de error del backend
          this.messageService.add({
            severity: 'error',
            summary: 'Operación Fallida',
            detail: response.mensaje || 'Error al enviar el código. Intente nuevamente.',
            life: 3000
          });
          this.loading = false;
        }
      },
      error: (err) => {
        this.loading = false;
        // Si el error es manejado por catchError en el servicio, el mensaje se mostrará aquí
        this.messageService.add({
          icon: 'pi pi-times',
          severity: 'error',
          summary: 'Operación Fallida',
          detail: err.mensaje || 'Error al enviar el código. Intente nuevamente.',
          life: 3000
        });
      }
    });
  }

  onVerificarOTP() {
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

    this.loading = true; // Activar el indicador de carga
    const codigoEncriotado = this.LoginService.encriptar(this.codigoOtp);

    this.AuthService.postVerificarOTP(codigoEncriotado, this.correo).subscribe({
      next: (response) => {
        this.loading = false; // Detener el indicador de carga

        if (response.success) {
          // Si la verificación es exitosa

          this.messageService.add({
            severity: 'success',
            summary: 'Operación Exitosa',
            detail: 'Código verificado correctamente.',
            life: 3000
          });
          this.otpVerificado = true;
          this.mostrarOtp = false;
          this.verLogin = true;

          // Establecer el idUsuario a partir de la respuesta
          this.idUsuario = response.idUsuario;
        }
      },
      error: (err) => {
        this.loading = false; // Detener el indicador de carga

        // Verificar si el error tiene un mensaje detallado
        const errorMessage = err.error?.message || 'Error en la verificación del código. Intente nuevamente.';

        // Mostrar el mensaje de error desde el backend o uno genérico
        if (errorMessage === 'El código ha expirado o ha sido bloqueado. Se le ha enviado un nuevo codigo a su dirección de correo electrónico.') {
          this.messageService.add({
            //icon: 'pi pi-exclamation-triangle',
            severity: 'warn',
            summary: 'Operación Fallida',
            detail: errorMessage,
            life: 7000
          });
        } else {
          this.messageService.add({
            //icon: 'pi pi-times',
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

    this.loading = true;
    // Encriptar la nueva contraseña
    const contrasenaEncriptada = this.LoginService.encriptar(this.nuevaContrasena);
    const codigoOtp = this.LoginService.encriptar(this.codigoOtp);
    // Llamar al servicio con correo, código OTP y la contraseña encriptada
    this.AuthService.postActualizarContrasena(this.correo, codigoOtp, contrasenaEncriptada).subscribe({
      next: () => {
        this.regresarLogin();
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Operación Exitosa',
          detail: 'La contraseña se ha actualizado con éxito.',
          life: 50000
        });
      },
      error: (err) => {
        this.loading = false;
        const mensajeError = err.error?.mensaje || 'Error al cambiar la contraseña. Intente nuevamente.';
        this.messageService.add({
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
