import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';

  mensajeError = '';
  mensajeOk = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion(): void {
    this.mensajeError = '';
    this.mensajeOk = '';

    if (!this.username || !this.password) {
      this.mensajeError = 'Ingrese usuario y contraseña.';
      return;
    }

    this.cargando = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (data) => {
        this.cargando = false;

        localStorage.setItem('usuarioKds', JSON.stringify(data));

        const rol = data.rol;

        if (rol === 'ROLE_ADMIN') {
          this.router.navigate(['/admin']);
          return;
        }

        if (rol === 'ROLE_CAJERO') {
          this.router.navigate(['/caja']);
          return;
        }

        if (rol === 'ROLE_COCINERO') {
          this.router.navigate(['/cocina']);
          return;
        }

        this.mensajeError = 'Rol no autorizado.';
      },
      error: (error) => {
        console.error('Error login:', error);
        this.cargando = false;
        this.mensajeError = 'Usuario o contraseña incorrectos.';
      }
    });
  }
}