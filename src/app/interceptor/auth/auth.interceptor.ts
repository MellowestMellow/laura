// Angular Core & Router
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// Angular HTTP Interceptor
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';

// RxJS
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Librerías externas
import * as CryptoJS from 'crypto-js';

// Servicios
import { AuthService } from '../../servicios/seguridad/acceso/auth/auth.service';

// Entorno (Environment)
import { environment } from '../../../environments/environment.development';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private secretKey = environment.secretKey;

  constructor(
    private authService: AuthService, 
    private router: Router,
  ) {}

// auth.interceptor.ts (solo la parte intercept modificada)
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = this.authService.getJwtToken();
  const idObjeto = this.authService.getIdObjeto();

  let modifiedReq = req;
  let headers: { [key: string]: string } = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (idObjeto) {
    const encryptedIdObjeto = CryptoJS.AES.encrypt(idObjeto.toString(), this.secretKey).toString();
    headers['x-data-key'] = encryptedIdObjeto;
  }

  // Lógica para x-nav-change: true si idObjeto cambió respecto al último registrado en esta pestaña
  try {
    const lastLogged = this.authService.getLastLoggedIdObjeto();
    if (idObjeto && idObjeto !== lastLogged) {
      headers['x-nav-change'] = 'true';
      // Actualizamos inmediatamente para que las siguientes peticiones de la misma pantalla sean false
      this.authService.setLastLoggedIdObjeto(idObjeto);
    } else {
      headers['x-nav-change'] = 'false';
    }
  } catch (e) {
    // on error: enviar false por seguridad
    headers['x-nav-change'] = 'false';
  }

  modifiedReq = req.clone({ setHeaders: headers });

  return next.handle(modifiedReq).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        if (req.url.includes('/login') && event.status === 200) {
          this.router.navigate(['/menu']);
        }

        const renewedToken = event.headers.get('x-renewed-token');
        if (renewedToken) {
          this.authService.setToken(renewedToken);
        }
      }
    }),
    catchError((err: HttpErrorResponse) => {
      const isTicketConsultation = req.url.includes('/seguridad/usuario/ticket');

      if (err.status === 401 && !isTicketConsultation) {
        this.authService.logout();
        this.router.navigate(['/login']);
      } else if (err.status === 403) {
        this.router.navigate(['/sin-acceso']);
      }

      return throwError(() => err);
    })
  );
}
}
