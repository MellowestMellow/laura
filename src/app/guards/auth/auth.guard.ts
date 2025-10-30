// Angular Router y Core
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';

// RxJS
import { of } from 'rxjs';

// Servicios
import { AuthService } from '../../servicios/seguridad/acceso/auth/auth.service';

// authGuard: Verificar si el usuario está autenticado y tiene permisos
export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);
  const idObjeto = route.data['pantallaId'];

  // Verificar si el usuario está autenticado
  if (authService.getJwtToken() === null || !authService.isAuthenticated()) {
    //console.log('Usuario no autenticado. Redirigiendo a login...');
    router.navigate(['/panel']);
    return of(false);
  }
  // Obtener el idObjeto de la ruta y guardarlo para enviarlo al backend
  if (!idObjeto) {
    //console.log('Pantalla ID no especificado. Redirigiendo a sin acceso...');
    router.navigate(['/sin-acceso']);
    return of(false);
  }

  authService.setIdObjeto(idObjeto); 
  return of(true); 
};

// loginGuard: Evitar que un usuario autenticado acceda a la página de login
export const loginGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getJwtToken() !== null && authService.isAuthenticated()) {
    router.navigate(['/menu']);
    return of(false);
  }

  return of(true);
};