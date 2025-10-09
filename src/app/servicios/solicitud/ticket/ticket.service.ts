// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// RxJS
import { Observable, throwError } from 'rxjs';

// Servicios
import { AuthService } from '../../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class TicketService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Métodos HTTP - GET
  getTipoSolicitud(idCategoria: any): Observable<any> {

    const token = this.authService.getJwtToken();  // Obtener el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Construir los params
    const params = new HttpParams().set('idCategoria', idCategoria);

    // Usar GET en lugar de POST
    return this.http.get(this.apiUrl + "/solicitud/tipo/solicitud", { headers, params });
  }

  getCategoriaSolicitud(): Observable<any> {

    const token = this.authService.getJwtToken();  // Obtener el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Usar GET en lugar de POST
    return this.http.get(this.apiUrl + "/solicitud/categoria/solicitud", { headers });
  }

  getTicket(ticket: string, correo: string): Observable<any> {
    const token = this.authService.getJwtToken()

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    })

    const params = new HttpParams().set("ticket", ticket).set("correo", correo)

    return this.http.get<any>(`${this.apiUrl}/solicitud/ticket`, { headers, params })
  }

  // Métodos HTTP - POST
  postTicket(Ticket: any): Observable<any> {
    // Hacer la solicitud GET incluyendo los headers
    return this.http.post<any>(this.apiUrl + '/solicitud/ticket', Ticket);
  }

  postTicketCurricular(Ticket: any): Observable<any> {
    // Hacer la solicitud GET incluyendo los headers
    return this.http.post<any>(this.apiUrl + '/solicitud/ticket/curricular', Ticket);
  }

  postTicketReservacion(Ticket: any): Observable<any> {
    // Hacer la solicitud GET incluyendo los headers
    return this.http.post<any>(this.apiUrl + '/solicitud/reservacion/salon', Ticket);
  }

}
