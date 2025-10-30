// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient, HttpParams} from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Entorno
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class EstructuraAcademicaService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`; 
 
  constructor(private http: HttpClient) { }

   // Métodos HTTP - GET
  getUniversidad(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/estructura/universidad');
  }

  getGradoAcademico(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/estructura/grado/academico');
  }

  getCampus(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/estructura/campus');
  }

  getDepartamento (data: { idCampus: number; idFacultad: number }): Observable<any> { 
    const params = new HttpParams()
      .set('idCampus', data.idCampus.toString())
      .set('idFacultad', data.idFacultad.toString());
    return this.http.get<any>(`${this.apiUrl}/estructura/departamento`, { params });
  }

  getFacultad(idCampus: any): Observable<any> {
    const params = new HttpParams().set('idCampus', idCampus);
    return this.http.get(this.apiUrl + "/estructura/facultad", { params });
  }

  getTituloAcademico(data: { idCampus: number; idFacultad: number }): Observable<any> {
  
    const params = new HttpParams()
      .set('idCampus', data.idCampus.toString())
      .set('idFacultad', data.idFacultad.toString());
    return this.http.get<any>(`${this.apiUrl}/estructura/titulo`, { params });
  }

  getTodosLosTituloAcademico(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estructura/titulo/academico`);
  }
  
}
