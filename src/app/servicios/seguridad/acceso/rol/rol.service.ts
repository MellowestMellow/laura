// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Servicios
import { AuthService } from '../../../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class RolService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`; // La URL de tu API

  constructor(private http: HttpClient, private authService: AuthService) { }

  private storageKey: string = 'nombreRol';

  setNombreRol(rol: string): void {
    localStorage.setItem(this.storageKey, rol);
  }

  clearNombreRol(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Métodos HTTP - GET
  getNombreRol(): string {
    return localStorage.getItem(this.storageKey) || ''; 
  }

  getRol(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/seguridad/rol', { headers });
  }

  getRolUsuario(idUsuario: any): Observable<any> {
    //console.log('idUsuario en el frontend:', idUsuario);  // Verifica que el valor esté presente

    const token = this.authService.getJwtToken();  // Obtener el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Construir los params
    const params = new HttpParams().set('idUsuario', idUsuario);

    // Usar GET en lugar de POST
    return this.http.get(this.apiUrl + "/seguridad/rol/usuario", { headers, params });
  }

  // Métodos HTTP - POST 
  postRol(Rol: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.post<any>(this.apiUrl + '/seguridad/rol', Rol, { headers });
  }

  // Métodos HTTP - PUT
  putRol(Rol: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/seguridad/rol', Rol, { headers });
  }

  putRolUsuario(Rol: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/seguridad/rol/usuario/', Rol, { headers });
  }

  // Métodos HTTP - DELETE
  deleteRol(idRol: string): Observable<any> {
    const token = this.authService.getJwtToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/seguridad/rol/${idRol}`, { headers });
  }

}
