// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders } from '@angular/common/http';

// RxJS
import { Observable, tap, throwError, Subject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Librerías externas - JWT
import { JwtHelperService } from '@auth0/angular-jwt';

// Librerías externas - Encriptación
import * as CryptoJS from 'crypto-js';

// Entorno
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`; 

  constructor(private http: HttpClient) { }

  private jwtHelper = new JwtHelperService();
  private logoutSubject = new Subject<void>(); // Subject para emitir eventos de logout
  private idObjeto: number | null = null
  private currentIdObjetoKey: number | null = null;

  // Último idObjeto que ya fue marcado como "navegado" por este tab
  setLastLoggedIdObjeto(id: number): void {
    this.currentIdObjetoKey = id;
  }

  getLastLoggedIdObjeto(): number | null {
    return this.currentIdObjetoKey;
  }

  // Utilidades
  public encriptar(valor: string): string {
    const hash = CryptoJS.SHA256(valor);
    return hash.toString();
  }

  public generarOtp(): string {
    const timestamp = Date.now().toString();
    const codigoOtp = timestamp.substring(timestamp.length - 6);
    return codigoOtp;
  }

  private handleError(error: any): Observable<never> {
    //console.error('Ocurrió un error:', error);
    return throwError(error);  // Re-lanzar el error
  }

  // Métodos HTTP - GET
  getRolesFromToken(): number[] | null {
    const token = this.getJwtToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);  // Decodifica el token JWT
      return decodedToken?.roles || null;  // Extrae el campo roles como un array
    }
    return null;
  }

    getIdUnidadAcademicaFromToken(): number[] | null {
    const token = this.getJwtToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);  // Decodifica el token JWT
      return decodedToken?.idUnidadAcademica || null;  // Extrae el campo roles como un array
    }
    return null;
  }
  
  getJwtToken(): string | null {
    return localStorage.getItem('token');
  }

  getNombreUsuario(): string | null {
    const token = this.getJwtToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.nombre || null; // Extrae el campo 'nombre' del token
    }
    return null;
  }

  getIdUsuario(): string | null {
    const token = this.getJwtToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.idUsuario || null; // Extrae el campo 'idUsuario' del token
    }
    return null;
  }

  getIdObjeto(): number | null {
    return this.idObjeto;
  }


  // Métodos HTTP - POST 
  postLogin(correo: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { correo, contrasena: password };

    return this.http.post(this.apiUrl + "/seguridad/usuario/login", body, { headers }).pipe(
      catchError(this.handleError),
      tap((response: any) => {
        // Guarda el usuario en localStorage después del inicio de sesión exitoso
        localStorage.setItem('user', JSON.stringify(response.user)); // Ajusta esto según cómo regreses el usuario
        this.setToken(response.token); // Si tienes un token, guárdalo
      })
    );
  }

  postLoginTicket(correo: string, ticket: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { correo, ticket }; // ← CORREGIDO aquí

    return this.http.post(this.apiUrl + "/seguridad/usuario/ticket", body, { headers }).pipe(
      catchError(this.handleError),
      tap((response: any) => {
        localStorage.setItem('user', JSON.stringify(response.user)); // opcional
        this.setToken(response.token); // ← asegúrate de que esto funcione correctamente
      })
    );
  }

  postRestablecimientoContraseña(correo: string): Observable<any> {
    // //console.log('Solicitando el envío del código OTP para:', correo);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { correo };

    return this.http.post(this.apiUrl + "/seguridad/usuario/correo", body, { headers }).pipe(
      catchError((error) => {
        //console.error('Error al solicitar el código OTP:', error);

        // Revisamos si el error contiene un mensaje del servidor
        let errorMessage = 'Hubo un error al enviar el código OTP. Por favor, inténtalo de nuevo.';

        // Si la respuesta contiene un cuerpo con el mensaje del servidor
        if (error.error && error.error.message) {
          errorMessage = error.error.message;  // Usamos el mensaje del backend
        }

        // Retornamos el mensaje para mostrarlo en el frontend
        return of({ error: true, mensaje: errorMessage });
      })
    );
  }

  postAutenticarPerfil(correo: string, contrasena: string): Observable<any> {
    // //console.log('Solicitando el envío del código OTP para:', correo);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { correo, contrasena };

    return this.http.post(this.apiUrl + "/seguridad/usuario/perfil", body, { headers }).pipe(
      catchError((error) => {
     
        // Revisamos si el error contiene un mensaje del servidor
        let errorMessage = 'Hubo un error al enviar el código OTP. Por favor, inténtalo de nuevo.';

        // Si la respuesta contiene un cuerpo con el mensaje del servidor
        if (error.error && error.error.message) {
          errorMessage = error.error.message;  // Usamos el mensaje del backend
        }

        // Retornamos el mensaje para mostrarlo en el frontend
        return of({ error: true, mensaje: errorMessage });
      })
    );
  }

  postVerificarOTP(codigoOtp: string, correo: string): Observable<any> {
    ////console.log('Verificando código OTP:', codigoOtp);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { codigoOtp, correo };

    return this.http.post(this.apiUrl + "/seguridad/usuario/verificar", body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  postActualizarContrasena(correo: string, codigoOTP: string, contrasenaNueva: string): Observable<any> {
    return this.http.post(this.apiUrl + "/seguridad/usuario/contrasena", {
      correo,
      codigoOTP,
      contrasenaNueva
    }).pipe(
      catchError((error) => {
        // Simplemente pasa el error original
        return throwError(() => error);
      })
    );
  }


  // Bitácora y Logout
   logout(): void {
    this.logoutSubject.next(); // Emitir evento de logout
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Eliminar el usuario del localStorage
    }
  }
  
  logouts(): void {
    this.logoutSubject.next(); // Emitir evento de logout
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Eliminar el usuario del localStorage
    }
  }

  onLogout(): Observable<void> {
    return this.logoutSubject.asObservable();
  }

  // Setters y Utilidades
   setIdObjeto(id: number): void {
    this.idObjeto = id;
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  isAuthenticated(): boolean {
    const token = this.getJwtToken();
    return !!token && !this.jwtHelper.isTokenExpired(token); // Verifica si el token es válido y no ha expirado
  }
 
}
