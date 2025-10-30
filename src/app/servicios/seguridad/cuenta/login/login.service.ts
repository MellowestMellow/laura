// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpClient } from '@angular/common/http';

// RxJS
import { Observable } from 'rxjs';

// Librerías externas - Encriptación
import * as CryptoJS from 'crypto-js';

// Entorno
import { environment } from '../../../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = `${environment.IP}/${environment.SITE}/${environment.API}/${environment.INTERNAL}/${environment.PROCESS_ENV}/${environment.MODULE}/${environment.VERSION}`; 

  constructor(private http: HttpClient) { }

  public encriptar(valor: string): string {
    const hash = CryptoJS.SHA256(valor);
    return hash.toString();
  }

  public generarOtp(): string {
    const timestamp = Date.now().toString();
    // Toma los últimos 6 caracteres del timestamp, excluyendo ceros
    const codigoOtp = timestamp.substring(timestamp.length - 6);
    return codigoOtp;
  }

  generarContrasenaAleatoria() {
    let digitos =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+';
    let contrasenia = '';
    for (let i = 0; i < 8; i++) {
      contrasenia += digitos[Math.floor(Math.random() * 74)];
    }
    return contrasenia;
  }

  login(correo: string, contrasena: string): Observable<any> {  
    const body = { correo, contrasena };
    return this.http.post<any>(this.apiUrl + '/seguridad/usuario/login', body);
  }

}
