// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders } from '@angular/common/http';

// RxJS
import { BehaviorSubject, map, Observable } from 'rxjs';

// Servicios
import { AuthService } from '../acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`; 

  constructor(private http: HttpClient, private authService: AuthService) { }

  private _notificaciones = new BehaviorSubject<any[]>([]);
  public notificaciones$ = this._notificaciones.asObservable();
  private _noLeidas = new BehaviorSubject<number>(0);
  public noLeidas$ = this._noLeidas.asObservable();


  getNotificaciónUsuario(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/seguridad/notificacion/usuario', { headers });
  }

  public recordatorios$ = this.notificaciones$.pipe(
    map(list => list.filter(n => !n.dfLeido && n.idTipoNotificacion === 12))
  );

  public notificacionesNuevas$ = this.notificaciones$.pipe(
    map(list => list.filter(n => !n.dfLeido && n.idTipoNotificacion !== 12))
  );

  refreshNotificaciones(): void {
    this.getNotificaciónUsuario().subscribe(list => {
      const datos = list.map((n: { fechaRegistro: string | number | Date; }) => ({
        ...n,
        fechaRegistro: new Date(n.fechaRegistro),
        expanded: false
      }));
      this._notificaciones.next(datos);
      this._noLeidas.next(datos.filter((x: { dfLeido: any; }) => !x.dfLeido).length);
    });
  }

  clearAll(): void {
    this._notificaciones.next([]);
    this._noLeidas.next(0);
  }

  // Métodos HTTP - GET
  getUsuarioPersona(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/seguridad/usuario', { headers });
  }

    getUnidadesAcademicas(): Observable<any> {
    const token = this.authService.getJwtToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/seguridad/unidades`, { headers });
  }


  // Métodos HTTP - POST
  postUsuarioPersona(UsuarioPersona: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.post<any>(this.apiUrl + '/seguridad/usuario', UsuarioPersona, { headers });
  }

  postNotificacion(notificacion: any): Observable<any> {
    const token = this.authService.getJwtToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post<any>(
      `${this.apiUrl}/seguridad/notificacion`,
      notificacion,
      { headers }
    );
  }

  // Métodos HTTP - PUT
  putUsuarioPersona(UsuarioPersona: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/seguridad/usuario', UsuarioPersona, { headers });
  }

  putCredencialPersona(UsuarioPersona: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/seguridad/credencial', UsuarioPersona, { headers });
  }

  putNotificacionUsuarioLeidas(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/seguridad/notificacion/leidas', { headers });
  }

  putInactivarUsuarioPersona(UsuarioPersona: any): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud PUT incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/seguridad/usuario/inactivar', UsuarioPersona, { headers });
  }

}
