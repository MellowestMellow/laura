// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Servicios
import { AuthService } from '../../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Métodos HTTP - GET
  getAsignacion(idCategoria: any): Observable<any> {

    const token = this.authService.getJwtToken();  // Obtener el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Construir los params
    const params = new HttpParams().set('idCategoria', idCategoria);

    // Usar GET en lugar de POST
    return this.http.get(this.apiUrl + "/asignacion", { headers, params });

  }

  getEtapasPorSolicitud(idSolicitud: number): Observable<any> {
    const token = this.authService.getJwtToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams().set('idSolicitud', idSolicitud.toString());

    return this.http.get(`${this.apiUrl}/etapas-por-solicitud`, { headers, params });
  }

  getLogAsignacion(idSolicitud: number): Observable<any> {
    const token = this.authService.getJwtToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams().set('idSolicitud', idSolicitud.toString());

    return this.http.get(`${this.apiUrl}/asignacion/log`, { headers, params });
  }

  getUsuariosAsignadosTicket(idSolicitud: any): Observable<any> {

    const token = this.authService.getJwtToken();  // Obtener el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Construir los params
    const params = new HttpParams().set('idSolicitud', idSolicitud);

    // Usar GET en lugar de POST
    return this.http.get(this.apiUrl + "/asignacion/usuario/ticket", { headers, params });
  }

  getUsuarioAsignacion(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/asignacion/usuario', { headers });
  }

  // Métodos HTTP - POST
  postDictaminarAsignacion(Solicitud: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud POST incluyendo los headers y el cuerpo de la solicitud
    return this.http.post<any>(this.apiUrl + '/asignacion/dictaminar', Solicitud, { headers });
  }

  postHabilitarEtapa(data: any): Observable<any> {
    const token = this.authService.getJwtToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // No es necesario subir archivos, solo datos JSON simples
    return this.http.post<any>(this.apiUrl + '/asignacion/habilitar/etapa', data, { headers });
  }

  postAgregarObservacion(data: any): Observable<any> {
    const token = this.authService.getJwtToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(this.apiUrl + '/asignacion/observacion', data, { headers });
  }

  // Métodos HTTP - PUT
  putRevisarAsignacion(Solicitud: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud POST incluyendo los headers y el cuerpo de la solicitud
    return this.http.put<any>(this.apiUrl + '/asignacion/revisar/dictamen', Solicitud, { headers });
  }

  putAsignarRevisionSolicitud(Asignacion: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/asignacion/revisar', Asignacion, { headers });
  }

  putAsignarSolicitudUsuario(Asignacion: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/asignacion/usuario', Asignacion, { headers });
  }

  putFechaAsignacion(Asignacion: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/asignacion/fecha', Asignacion, { headers });
  }

  putMiembrosAsignacion(Asignacion: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/asignacion/miembros', Asignacion, { headers });
  }

}
