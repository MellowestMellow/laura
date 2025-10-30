// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders} from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Servicios
import { AuthService } from '../../../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class PerfilService {

 private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`; 

  constructor(private http: HttpClient, private authService: AuthService) { }

  getNombreUsuario(correo: string): Observable<any> {
    // Realizar la solicitud GET
 
    return this.http.get<any>(this.apiUrl + `/seguridad/nombre/usuario`, correo ? { params: { correo } } : {});
  }

  // Métodos HTTP - GET
  getPersonaPerfil(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/seguridad/perfil/usuario', { headers });
  }

  // Métodos HTTP - PUT
  putPerfilPersona(UsuarioPersona:any ): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<any>(this.apiUrl + '/seguridad/perfil/usuario', UsuarioPersona,{ headers });
  }
  
}

