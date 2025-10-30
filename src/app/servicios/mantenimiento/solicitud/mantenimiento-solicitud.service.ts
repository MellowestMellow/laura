// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders } from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Servicios
import { AuthService } from '../../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoSolicitudService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}/solicitud/`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Métodos HTTP - GET
  // Metodo para obtener los tipos de solicitud
  getEstados(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + 'estados', { headers });
  }

  // Método para obtener los tipos de solicitud
  getEtapas(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + 'etapas', { headers });
  }

  // Método para obtener las categorías de solicitud
  getCategorias(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + 'categorias', { headers });
  }

  // Métodos HTTP - POST
  // Método para crear un nuevo tipo de solicitud
  postTipoSolicitud(tipo: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud POST incluyendo los headers
    return this.http.post<any>(this.apiUrl + 'tipo', tipo, { headers });
  }

  // Método para crear un nuevo estado de solicitud
  postEstadoSolicitud(estado: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud POST incluyendo los headers
    return this.http.post<any>(this.apiUrl + 'estado', estado, { headers });
  }

  // Métodos HTTP - PUT
  // Método para actualizar una categoría de solicitud    
  putCategoria(categoria: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + 'categoria', categoria, { headers });
  }

  // Método para actualizar un tipo de solicitud
  putTipoSolicitud(tipo: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + 'tipo', tipo, { headers });
  }

  // Método para actualizar una etapa de solicitud
  putEtapaSolicitud(etapa: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + 'etapa', etapa, { headers });
  }

  // Método para actualizar un estado de solicitud
  putEstadoSolicitud(estado: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + 'estado', estado, { headers });
  }

}