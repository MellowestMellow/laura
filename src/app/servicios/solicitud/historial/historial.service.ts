// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// RxJS
import { Observable, catchError, map, of } from 'rxjs';

// Servicios
import { AuthService } from '../../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class HistorialService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`;

  constructor(private http: HttpClient, private authService: AuthService) { }


  private coloresFondo: { [key: number]: string } = {
    1: '#e0e6ed', // Creado
    2: '#d1ecf1', // Enviado a Evaluación
    3: '#d4edda', // Aprobado
    4: '#f8d7da', // Denegado
    5: '#cce5ff', // Asignado
    6: '#b8daff', // Reasignado
    7: '#ffe8cc', // En Revisión
    8: '#fff3cd', // En Corrección
    9: '#d1f2eb', // Etapa de Plan de Diagnóstico
    10: '#ffe8cc', // En Revisión Plan de Diagnóstico
    11: '#fff3cd', // En Corrección Plan de Diagnóstico
    12: '#d1f2eb', // Etapa de Plan de Factibilidad
    13: '#ffe8cc', // En Revisión Plan de Factibilidad
    14: '#fff3cd', // En Corrección Plan de Factibilidad
    15: '#d1f2eb', // Etapa de Plan de Estudio
    16: '#ffe8cc', // En Revisión Plan de Estudio
    17: '#fff3cd', // En Corrección Plan de Estudio
    18: '#e2e3f3', // Dictaminado

    // Nuevos estados
    19: '#cce5ff', // Asignado a Departamento
    20: '#b8daff', // En revisión por el Departamento
    21: '#ffe8cc', // Pre-Revisión del Plan de Diagnóstico
    22: '#ffe8cc', // Pre-Revisión del Plan de Factibilidad
    23: '#ffe8cc', // Pre-Revisión del Plan de Estudio
    24: '#d1ecf1', // En Evaluación
    25: '#e0e6ed', // No Iniciada
    26: '#d4edda'  // Finalizada
  };

  private coloresTexto: { [key: number]: string } = {
    1: '#495057', // Creado
    2: '#0c5460', // Enviado a Evaluación
    3: '#155724', // Aprobado
    4: '#721c24', // Denegado
    5: '#004085', // Asignado
    6: '#003865', // Reasignado
    7: '#856404', // En Revisión
    8: '#856404', // En Corrección
    9: '#0f5132', // Etapa de Plan de Diagnóstico
    10: '#855404', // En Revisión Plan de Diagnóstico
    11: '#856404', // En Corrección Plan de Diagnóstico
    12: '#0f5132', // Etapa de Plan de Factibilidad
    13: '#855404', // En Revisión Plan de Factibilidad
    14: '#856404', // En Corrección Plan de Factibilidad
    15: '#0f5132', // Etapa de Plan de Estudio
    16: '#855404', // En Revisión Plan de Estudio
    17: '#856404', // En Corrección Plan de Estudio
    18: '#383d56', // Dictaminado

    // Nuevos estados
    19: '#004085', // Asignado a Departamento
    20: '#003865', // En revisión por el Departamento
    21: '#855404', // Pre-Revisión del Plan de Diagnóstico
    22: '#855404', // Pre-Revisión del Plan de Factibilidad
    23: '#855404', // Pre-Revisión del Plan de Estudio
    24: '#0c5460', // En Evaluación
    25: '#495057', // No Iniciada
    26: '#155724'  // Finalizada
  };

  getColorFondo(id: number): string {
    return this.coloresFondo[id] || '#f0f0f0';
  }

  getColorTexto(id: number): string {
    return this.coloresTexto[id] || '#333';
  }

  // Métodos HTTP - GET
  getHistorial(idSolicitud: number, idEtapa?: number): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });
    // Construir los params
    let params = new HttpParams().set('idSolicitud', idSolicitud.toString());

    if (idEtapa !== undefined && idEtapa !== null) {
      params = params.set('idEtapa', idEtapa.toString());
    }
    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/solicitud/historial/estado', { headers, params }).pipe(
      map(data =>
        (data || []).map((item: any) => {
          const fecha = new Date(item.fechaModifico);
          return {
            ...item,
            fechaRegistro: fecha,
            fechaFormateada: new Intl.DateTimeFormat('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }).format(fecha)
          };
        })
      ),
      catchError(err => {
        //console.error('❌ Error al cargar historial:', err);
        return of([]);
      })
    );
  }

}
