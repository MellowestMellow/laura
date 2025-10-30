// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders } from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Servicios
import { AuthService } from '../../../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoFacultadService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`;
 
  constructor(private http: HttpClient, private authService: AuthService) { }

   // Métodos HTTP - GET
  getFacultad(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/estructura/academica/facultad', { headers });
  }

   // Métodos HTTP - POST
  postFacultad(data: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.post<any>(this.apiUrl + '/estructura/academica/facultad', data,{ headers });
  }

   // Métodos HTTP - PUT
  putFacultad(data: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/estructura/academica/facultad', data, { headers });
  }

   // Métodos HTTP - DELETE
  deleteFacultad(idFacultad: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.delete<any>(`${this.apiUrl}/estructura/academica/facultad/${idFacultad}`, { headers });
  }

}
