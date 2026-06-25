import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const usuarioGuardado = localStorage.getItem('usuarioKds');

  if (!usuarioGuardado) {
    router.navigate(['/login']);
    return false;
  }

  const usuario = JSON.parse(usuarioGuardado);
  const rol = usuario.rol;

  const ruta = state.url;

  if (ruta.startsWith('/admin') && rol !== 'ROLE_ADMIN') {
    router.navigate(['/login']);
    return false;
  }

  if (ruta.startsWith('/caja') && rol !== 'ROLE_CAJERO') {
    router.navigate(['/login']);
    return false;
  }

  if (ruta.startsWith('/cocina') && rol !== 'ROLE_COCINERO') {
    router.navigate(['/login']);
    return false;
  }

  return true;
};