// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders } from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Servicios
import { AuthService } from '../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class ComisionService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`; 
 
  constructor(private http: HttpClient, private authService: AuthService) { }

   // Métodos HTTP - GET
  getComision(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/comision', { headers });
  }

  getIntegrantes(idSubComision: any, idSolicitud: any): Observable<any> {

    const token = this.authService.getJwtToken();  // Obtener el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params: any = {};
    if (idSubComision !== null && idSubComision !== undefined) {
      params.idSubComision = idSubComision;
    }
    if (idSolicitud !== null && idSolicitud !== undefined) {
      params.idSolicitud = idSolicitud;
    }

    return this.http.get(this.apiUrl + "/comision/integrante", { headers, params });
  }

  getInfoSubcomision(idCampusTituloAcademico: number): Observable<any> {
    const token = this.authService.getJwtToken();  // Obtener el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Usar GET en lugar de POST
    return this.http.get(this.apiUrl + `/informacion/subcomision/curricular/${idCampusTituloAcademico}`, { headers });
  }

  getUsuarioSubComision(): Observable<any> {
    const token = this.authService.getJwtToken();  // Obtener el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Usar GET en lugar de POST
    return this.http.get(this.apiUrl + "/sub/comision/usuario", { headers });
  }

  getSolicitudesPorSubComision(idSubComision: number): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + `/sub/comision/solicitudes/${idSubComision}`, { headers });
  }

    // Métodos HTTP - PUT
  putEstadoComision(Comision: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/comision/estado', Comision, { headers });
  }

  putEstadoSubComision(Comision: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/sub/comision/estado', Comision, { headers });
  }

  putIntegrantes(Comision: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/sub/comision/integrante', Comision, { headers });
  }
}

