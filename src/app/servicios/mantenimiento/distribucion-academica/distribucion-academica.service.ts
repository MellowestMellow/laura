import { Injectable } from '@angular/core';

// Entorno
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../seguridad/acceso/auth/auth.service';
import { Observable } from 'rxjs';

interface distribucion {
  idUsuario: number,
  carreras: string
}

@Injectable({
  providedIn: 'root'
})

export class DistribucionAcademicaService {
  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}/carga/academica/docente`;


  constructor(private http: HttpClient, private authService: AuthService) { }

  getDistribucion(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl, { headers });
  }

  getDocentes(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/unidad/academica',  { headers });
  }

  getTitulos(): Observable<any> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.get<any>(this.apiUrl + '/titulo/academico',  { headers });
  }
  postDistribucion(distribucion : distribucion[]): Observable<distribucion[]> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.post<distribucion[]>(this.apiUrl, distribucion, { headers });
  }

  putDistribucion(distribucion: distribucion[]): Observable<distribucion[]> {
    // Obtener el token desde el AuthService
    const token = this.authService.getJwtToken();

    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });

    // Hacer la solicitud GET incluyendo los headers
    return this.http.put<distribucion[]>(this.apiUrl, distribucion, { headers });
  }
  
}
