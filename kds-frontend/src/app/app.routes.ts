import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CajaComponent } from './pages/caja/caja.component';
import { CocinaComponent } from './pages/cocina/cocina.component';
import { AdminComponent } from './pages/admin/admin.component';
import { PagoExitosoComponent } from './pages/pago-exitoso/pago-exitoso.component';
import { PagoErrorComponent } from './pages/pago-error/pago-error.component';
import { PagoPendienteComponent } from './pages/pago-pendiente/pago-pendiente.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { path: 'caja', component: CajaComponent, canActivate: [authGuard] },
  { path: 'cocina', component: CocinaComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },

  { path: 'pago-exitoso', component: PagoExitosoComponent },
  { path: 'pago-error', component: PagoErrorComponent },
  { path: 'pago-pendiente', component: PagoPendienteComponent },

  { path: '**', redirectTo: 'login' }
];