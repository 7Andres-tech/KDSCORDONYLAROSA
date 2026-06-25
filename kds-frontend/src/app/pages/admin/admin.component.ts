import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { AdminService } from '../../services/admin.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  @ViewChild('graficoVentasHora') graficoVentasHora!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoEstados') graficoEstados!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoPlatos') graficoPlatos!: ElementRef<HTMLCanvasElement>;

  chartVentasHora: Chart | null = null;
  chartEstados: Chart | null = null;
  chartPlatos: Chart | null = null;

  fechaInicioAdmin = '';
  fechaFinAdmin = '';

  ventasTotales = 0;
  pedidosCompletados = 0;
  ticketPromedio = 0;

  usuarios: any[] = [];
  productos: any[] = [];
  notificaciones: any[] = [];

  mostrarNotificacion = false;
  intervaloNotificaciones?: any;

  usuarioForm: any = {
    id: null,
    username: '',
    password: '',
    rol: 'ROLE_CAJERO',
    activo: true
  };

  productoForm: any = {
    id: null,
    nombre: '',
    precio: null,
    categoria: '',
    imagen: '',
    activo: true
  };

  constructor(
    private adminService: AdminService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    const hoy = new Date().toISOString().split('T')[0];

    this.fechaInicioAdmin = hoy;
    this.fechaFinAdmin = hoy;

    setTimeout(() => {
      this.cargarDashboard(hoy, hoy);
    });

    this.cargarUsuarios();
    this.cargarProductos();
    this.cargarNotificaciones();

    this.intervaloNotificaciones = setInterval(() => {
      this.cargarNotificaciones();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.chartVentasHora) this.chartVentasHora.destroy();
    if (this.chartEstados) this.chartEstados.destroy();
    if (this.chartPlatos) this.chartPlatos.destroy();

    if (this.intervaloNotificaciones) {
      clearInterval(this.intervaloNotificaciones);
    }
  }

  cargarDashboard(fechaInicio?: string, fechaFin?: string): void {
    const request = fechaInicio && fechaFin
      ? this.adminService.obtenerDashboardPorFechas(fechaInicio, fechaFin)
      : this.adminService.obtenerDashboard();

    request.subscribe({
      next: (data) => {
        this.ventasTotales = Number(data.ventasTotales || 0);
        this.pedidosCompletados = Number(data.pedidosCompletados || 0);
        this.ticketPromedio = Number(data.ticketPromedio || 0);

        this.renderGraficos(data);
      },
      error: (error) => {
        console.error('Error cargando dashboard:', error);
      }
    });
  }

  filtrarDashboard(): void {
    if (!this.fechaInicioAdmin || !this.fechaFinAdmin) {
      alert('Selecciona fecha inicio y fecha fin');
      return;
    }

    if (this.fechaFinAdmin < this.fechaInicioAdmin) {
      alert('La fecha fin no puede ser menor que la fecha inicio');
      return;
    }

    this.cargarDashboard(this.fechaInicioAdmin, this.fechaFinAdmin);
  }

  verHoy(): void {
    const hoy = new Date().toISOString().split('T')[0];

    this.fechaInicioAdmin = hoy;
    this.fechaFinAdmin = hoy;

    this.cargarDashboard(hoy, hoy);
  }

  renderGraficos(data: any): void {
    const ventasHora = data.ventasPorHora || {};
    const estados = data.pedidosPorEstado || {};
    const platos = data.platosMasVendidos || [];

    if (this.chartVentasHora) this.chartVentasHora.destroy();
    if (this.chartEstados) this.chartEstados.destroy();
    if (this.chartPlatos) this.chartPlatos.destroy();

    this.chartVentasHora = new Chart(this.graficoVentasHora.nativeElement, {
      type: 'line',
      data: {
        labels: Object.keys(ventasHora).map(h => `${h}:00`),
        datasets: [{
          label: 'Ventas por hora S/',
          data: Object.values(ventasHora).map(v => Number(v || 0)),
          borderWidth: 3,
          tension: 0.35,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    this.chartEstados = new Chart(this.graficoEstados.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(estados),
        datasets: [{
          data: Object.values(estados).map(v => Number(v || 0))
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    this.chartPlatos = new Chart(this.graficoPlatos.nativeElement, {
      type: 'bar',
      data: {
        labels: platos.map((p: any) => p.plato),
        datasets: [{
          label: 'Cantidad vendida',
          data: platos.map((p: any) => Number(p.cantidad || 0)),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  cargarUsuarios(): void {
    this.adminService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data || [];
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  guardarUsuario(): void {
    if (!this.usuarioForm.username) {
      alert('Ingresa el nombre de usuario');
      return;
    }

    if (!this.usuarioForm.id && !this.usuarioForm.password) {
      alert('Ingresa una contraseña para el usuario nuevo');
      return;
    }

    const body = {
      username: this.usuarioForm.username,
      password: this.usuarioForm.password,
      rol: this.usuarioForm.rol,
      activo: this.usuarioForm.activo
    };

    const request = this.usuarioForm.id
      ? this.adminService.actualizarUsuario(this.usuarioForm.id, body)
      : this.adminService.crearUsuario(body);

    request.subscribe({
      next: () => {
        alert('Usuario guardado correctamente');
        this.limpiarFormularioUsuario();
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error guardando usuario:', error);
        alert('Error al guardar usuario');
      }
    });
  }

  editarUsuario(usuario: any): void {
    this.usuarioForm = {
      id: usuario.id,
      username: usuario.username,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo
    };
  }

  eliminarUsuario(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;

    this.adminService.eliminarUsuario(id).subscribe({
      next: () => {
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error eliminando usuario:', error);
        alert('Error al eliminar usuario');
      }
    });
  }

  limpiarFormularioUsuario(): void {
    this.usuarioForm = {
      id: null,
      username: '',
      password: '',
      rol: 'ROLE_CAJERO',
      activo: true
    };
  }

  cargarProductos(): void {
    this.productoService.listarProductos().subscribe({
      next: (data) => {
        this.productos = data || [];
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
      }
    });
  }

  guardarProducto(): void {
    if (!this.productoForm.nombre || !this.productoForm.precio || !this.productoForm.categoria) {
      alert('Completa nombre, precio y categoría');
      return;
    }

    const body = {
      nombre: this.productoForm.nombre,
      precio: Number(this.productoForm.precio),
      categoria: this.productoForm.categoria,
      imagen: this.productoForm.imagen,
      activo: true
    };

    const request = this.productoForm.id
      ? this.productoService.actualizarProducto(this.productoForm.id, body)
      : this.productoService.crearProducto(body);

    request.subscribe({
      next: () => {
        alert('Producto guardado correctamente');
        this.limpiarProducto();
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error guardando producto:', error);
        alert('Error al guardar producto');
      }
    });
  }

  editarProducto(producto: any): void {
    this.productoForm = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      imagen: producto.imagen,
      activo: producto.activo
    };
  }

  eliminarProducto(id: number): void {
    if (!confirm('¿Eliminar producto?')) return;

    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar producto');
      }
    });
  }

  limpiarProducto(): void {
    this.productoForm = {
      id: null,
      nombre: '',
      precio: null,
      categoria: '',
      imagen: '',
      activo: true
    };
  }

  cargarNotificaciones(): void {
    this.adminService.listarNotificaciones().subscribe({
      next: async (data) => {
        this.notificaciones = data || [];

        const hayNueva = this.notificaciones.some(n => !n.leida);

        if (hayNueva) {
          this.mostrarNotificacion = true;

          setTimeout(() => {
            this.mostrarNotificacion = false;
          }, 5000);

          this.adminService.marcarNotificacionesLeidas().subscribe();
        }
      },
      error: (error) => {
        console.error('Error cargando notificaciones:', error);
      }
    });
  }

  obtenerImagen(imagen: string): string {
    if (!imagen) {
      return '/img/default.png';
    }

    if (imagen.startsWith('http')) {
      return imagen;
    }

    if (imagen.startsWith('/')) {
      return imagen;
    }

    return `/${imagen}`;
  }

  cerrarSesion(): void {
    fetch('/logout', {
      method: 'POST'
    }).then(() => {
      localStorage.removeItem('usuarioKds');
      window.location.href = '/login';
    });
  }
}