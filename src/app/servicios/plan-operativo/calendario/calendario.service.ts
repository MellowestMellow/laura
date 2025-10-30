// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// RxJS

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Servicios
import { AuthService } from '../../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../environments/environment.development';

interface Respuesta {
  success: boolean;
  mensaje: string;
}

export interface EventoBackEnd {
  idCalendario: number;
  idUnidadAcademica: number;
  nombreUnidadAcademica: string;
  idProceso: number;
  proceso: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface EventoNuevo {
  nombreInstancia: string;
  producto: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  idInstancia: number;
}

@Injectable({
  providedIn: 'root'
})

export class CalendarioService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getMetricasGenerales( trimestre?: number, anio?: number): Observable<any> {
    const token = this.authService.getJwtToken();
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams();

    if (trimestre !== undefined && trimestre !== null) {
      params = params.set('trimestre', trimestre.toString());
    } else if (anio !== undefined && anio !== null) {
      params = params.set('anio', anio.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/solicitud/metricas-generales`, { params, headers })
      .pipe(catchError(this.handleError));
  }

  getMetricasParaDescarga(anio?: number, trimestre?: number): Observable<any> {
    let params = new HttpParams();

    if (trimestre !== undefined && trimestre !== null) {
      params = params.set('trimestre', trimestre.toString());
    } else if (anio !== undefined && anio !== null) {
      params = params.set('anio', anio.toString());
    }

    // 🔹 No mandamos idUnidadAcademica, lo resuelve el backend con el token

    return this.http.get<any>(`${this.apiUrl}/solicitud/metricas/descarga`, { params })
      .pipe(catchError(this.handleError));
  }

  getMetricasSolicitudesPorUnidad(): Observable<any> {
  const token = this.authService.getJwtToken();
  let headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any>(`${this.apiUrl}/solicitud/metricas/solicitudes/unidad`, { headers })
    .pipe(catchError(this.handleError));
}


  getMetricaUsuarioInterno(idUsuario?: number): Observable<any> {
  const token = this.authService.getJwtToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  let url = `${this.apiUrl}/solicitud/metrica-usuario-interno`;

  if (idUsuario !== undefined && idUsuario !== null) {
    url += `?idUsuario=${idUsuario}`;
  }

  return this.http.get<any>(url, { headers }).pipe(catchError(this.handleError));
}

// Para obtener métricas solo del usuario del token (sin parámetros)
getMetricaUsuarioToken(): Observable<any> {
  const token = this.authService.getJwtToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any>(`${this.apiUrl}/solicitud/metrica-usuario`, { headers }).pipe(catchError(this.handleError));
}

// Descargar métricas internas (modo exportación)
getMetricaUsuarioInternoDescarga(idUsuario?: number): Observable<any> {
  let params = new HttpParams();

  // 🔹 Solo enviamos el parámetro si realmente hay un idUsuario válido (> 0)
  if (idUsuario && idUsuario > 0) {
    params = params.set('idUsuario', idUsuario.toString());
  }

  return this.http
    .get<any>(`${this.apiUrl}/solicitud/metrica-usuario-interno-descarga`, { params })
    .pipe(catchError(this.handleError));
}

getMetricasUsuarioExterno(): Observable<any> {
  const token = this.authService.getJwtToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  let url = `${this.apiUrl}/solicitud/metrica-externo`;

  return this.http.get<any>(url, { headers }).pipe(catchError(this.handleError));
}


  getEventos(idTipoCalendario: number): Observable<{ success: boolean; result: EventoBackEnd[] }> {
    return this.http
      .get<{ success: boolean; result: EventoBackEnd[] }>(
        `${this.apiUrl}/actividades/calendario/${idTipoCalendario}`
      )
      .pipe(catchError(this.handleError));
  }

  // Implementación del método para enviar datos del proceso académico
postProcesoAcademico(evento: EventoNuevo): Observable<Respuesta> {
  const token = this.authService.getJwtToken();
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.post<Respuesta>(`${this.apiUrl}/proceso/academico`, evento, { headers })
    .pipe(catchError(this.handleError));
}

  private handleError(error: any): Observable<never> {
    return throwError(() => error);
  }

}
