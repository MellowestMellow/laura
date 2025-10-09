// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpHeaders } from '@angular/common/http';

// RxJS
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Servicios
import { AuthService } from '../seguridad/acceso/auth/auth.service';

// Entorno
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class ArchivoService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`; 
 
  constructor(private http: HttpClient, private AuthService: AuthService,) { }

  maxSizeInBytes = 4 * 1024 * 1024; // 4 MB

  validFileTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg', // JPG
    'image/png',  // PNG
    // Añade más tipos MIME si es necesario
  ];

  isValidFile(file: File): boolean {
    return this.validFileTypes.includes(file.type) && file.size <= this.maxSizeInBytes;
  }

   // Métodos HTTP - GET
  getArchivos(keys: string, bucket: string): Observable<any> {
    const token = this.AuthService.getJwtToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });
    const body = { keys, bucket };
    return this.http.post<any>(`${this.apiUrl}/get-archivos`, body, { headers });

  }

  getArchivosPublic(keys: string, bucket: string): Observable<any> {
    const token = this.AuthService.getJwtToken();
    // Crear los headers con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Incluir el token en el header Authorization
    });
    const body = { keys, bucket };
    return this.http.post<any>(`${this.apiUrl}/get-archivos/public`, body, { headers });
  }

   // Métodos HTTP - POST
  sendPost(body: FormData): Observable<any> {
    ////console.log('Body',body);
    return this.http.post<any>(`${this.apiUrl}/send-post`, body).pipe(
      catchError(error => {
        //console.error('Error en sendPost:', error);
        return throwError(error);
      })
    );
  }
}