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
export class SolicitudService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Métodos HTTP - GET
  getSolicitud(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/solicitud', { headers });
  }

  getHistoralSolicitud(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/solicitud/historial', { headers });
  }

  getSolicitudUsuario(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/solicitud/usuario', { headers });
  }

  getSolicitudCurricular(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/solicitud/curricular', { headers });
  }

  getHistorialSolicitudCurricular(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/solicitud/curricular/historial', { headers });
  }

  // Métodos HTTP - POST
  postEnviarCorreoAsignado(Solicitud: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.post<any>(this.apiUrl + '/solicitud/correo/asignado', Solicitud, { headers });
  }

  // Métodos HTTP - PUT
  putEstado(Solicitud: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/solicitud/estado/etapa', Solicitud, { headers });
  }

  putEstadoPlantilla(Solicitud: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/solicitud/estado/etapa/plantilla', Solicitud, { headers });
  }

  putDenegarSolicitud(Solicitud: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/solicitud/denegar', Solicitud, { headers });
  }

  putDictaminarFormato(solicitud: any, files: File[]): Observable<any> {
    const token = this.authService.getJwtToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const formData = new FormData();

    // 📦 Payload (campos de la solicitud)
    Object.entries(solicitud).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // 📎 Archivos
    if (files && files.length > 0) {
      files.forEach((file: File) => {
        formData.append('image', file, file.name); // <-- coincide con upload.array('image', 5)
      });
    }

    return this.http.put<any>(
      this.apiUrl + '/solicitud/dictaminar/formato',
      formData,
      { headers }
    );
  }


getHistorialArchivo(data: { idSolicitud: number }): Observable<any> {
  const token = this.authService.getJwtToken();

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  // enviar el parámetro como query string
  const params = new HttpParams().set('idSolicitud', data.idSolicitud.toString());

  return this.http.get<any>(this.apiUrl + '/solicitud/archivo', { headers, params });
}


}
