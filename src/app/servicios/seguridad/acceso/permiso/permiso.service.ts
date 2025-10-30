// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Servicios
import { AuthService } from '../../../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../../environments/environment.development';
 
@Injectable({
  providedIn: 'root'
})

export class PermisoService {
  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`; // La URL de tu API

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Métodos HTTP - GET
  getPermiso(data: { idObjeto: number; roles: number[] }): Observable<any> {
    const token = this.authService.getJwtToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('idObjeto', data.idObjeto.toString())
      .set('roles', data.roles.join(','));  // Array a string separado por comas

    return this.http.get<any>(`${this.apiUrl}/permiso`, { headers, params });
  }

  getPermisoRol(idRol: number): Observable<any> {
    const token = this.authService.getJwtToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('idRol', idRol.toString());

    // Realiza la solicitud GET e incluye los headers y los parámetros en la URL
    return this.http.get<any>(`${this.apiUrl}/permiso/rol`, { headers, params });
  }

  // Métodos HTTP - POST
  postPermisosMenu(): Observable<any> {
    const token = this.authService.getJwtToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Envía el array de roles dentro de un objeto { roles: roles }
    return this.http.get<any>(this.apiUrl + '/permiso/menu', { headers });
  }

  // Métodos HTTP - PUT
  putPermisoRol(permiso: any): Observable<any> {
    const token = this.authService.getJwtToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/permiso/rol`, permiso, { headers });
  }

}
