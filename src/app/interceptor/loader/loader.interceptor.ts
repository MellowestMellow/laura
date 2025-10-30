// Angular Core
import { Injectable } from '@angular/core';

// Angular HTTP
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

// Angular Router
import { Router, NavigationEnd } from '@angular/router';

// RxJS
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Servicios
import { SpinnerService } from '../../servicios/diseno/spinner/spinner.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  constructor(private spinnerService: SpinnerService, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.spinnerService.startNavigationSpinner(); // Inicia el spinner en la navegación
      }
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo muestra el spinner para la primera solicitud de la página
    if (!this.spinnerService.hasShownSpinnerForCurrentPage()) {
      this.spinnerService.showLoader();
    }

    return next.handle(request).pipe(
      finalize(() => {
        this.spinnerService.hideLoader(); // Finaliza el spinner cuando las solicitudes terminan
      })
    );
  }
}
