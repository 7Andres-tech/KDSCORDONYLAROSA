import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caja.component.html',
  styleUrl: './caja.component.css'
})
export class CajaComponent implements OnInit, OnDestroy {

  productos: any[] = [];
  productosFiltrados: any[] = [];
  categorias: string[] = [];
  categoriasAgrupadas: any[] = [];

  pedido: any[] = [];
  pedidosListos: any[] = [];
  mostrados = new Set<number>();

  textoBusqueda = '';
  categoriaSeleccionada = '';

  fechaInicioReporte = '';
  fechaFinReporte = '';
  enviandoReporte = false;
  cargandoProductos = false;
  creandoPago = false;

  modalPedidoListo: any = null;

  audioActivo = false;
  audio?: HTMLAudioElement;

  intervaloPedidos?: any;

  constructor(
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private reporteService: ReporteService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.activarAudio();
    this.cargarProductos();
    this.cargarPedidosListos();

    this.intervaloPedidos = setInterval(() => {
      this.cargarPedidosListos();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervaloPedidos) {
      clearInterval(this.intervaloPedidos);
    }
  }

  activarAudio(): void {
    document.addEventListener('click', () => {
      if (!this.audioActivo) {
        this.audio = new Audio('/audio/audionotificacion.mp3');
        this.audio.volume = 1;
        this.audio.preload = 'auto';

        this.audio.play()
          .then(() => {
            this.audio?.pause();

            if (this.audio) {
              this.audio.currentTime = 0;
            }

            this.audioActivo = true;
          })
          .catch(() => {});
      }
    }, { once: true });
  }

  reproducirSonido(): void {
    if (!this.audioActivo || !this.audio) return;

    try {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    } catch (error) {
      console.log('Error audio:', error);
    }
  }

  cargarProductos(): void {
    this.cargandoProductos = true;

    this.productoService.listarProductos().subscribe({
      next: (data) => {
        this.productos = data || [];
        this.productosFiltrados = [...this.productos];
        this.cargarCategorias();
        this.agruparProductos();
        this.cargandoProductos = false;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        alert('No se pudieron cargar los productos.');
        this.cargandoProductos = false;
      }
    });
  }

  cargarCategorias(): void {
    this.categorias = [
      ...new Set(
        this.productos
          .map(p => p.categoria)
          .filter(c => c !== null && c !== undefined && c !== '')
      )
    ].sort();
  }

  aplicarFiltros(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();
    const categoria = this.categoriaSeleccionada;

    this.productosFiltrados = this.productos.filter(prod => {
      const nombre = prod.nombre ? prod.nombre.toLowerCase() : '';
      const cat = prod.categoria ? prod.categoria.toLowerCase() : '';

      const coincideTexto =
        nombre.includes(texto) ||
        cat.includes(texto);

      const coincideCategoria =
        categoria === '' || prod.categoria === categoria;

      return coincideTexto && coincideCategoria;
    });

    this.agruparProductos();
  }

  agruparProductos(): void {
    const grupos: any = {};

    this.productosFiltrados.forEach(prod => {
      const categoria = prod.categoria || 'Sin categoría';

      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }

      grupos[categoria].push(prod);
    });

    this.categoriasAgrupadas = Object.keys(grupos)
      .sort()
      .map(categoria => ({
        categoria,
        productos: grupos[categoria]
      }));
  }

  agregar(productoId: number): void {
    const producto = this.productos.find(p => Number(p.id) === Number(productoId));
    if (!producto) return;

    const existente = this.pedido.find(i => Number(i.productoId) === Number(productoId));

    if (existente) {
      existente.cantidad += 1;
    } else {
      this.pedido.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio || 0),
        img: producto.imagen,
        cantidad: 1
      });
    }
  }

  sumar(productoId: number): void {
    const item = this.pedido.find(i => Number(i.productoId) === Number(productoId));
    if (!item) return;

    item.cantidad += 1;
  }

  restar(productoId: number): void {
    const item = this.pedido.find(i => Number(i.productoId) === Number(productoId));
    if (!item) return;

    item.cantidad -= 1;

    if (item.cantidad <= 0) {
      this.pedido = this.pedido.filter(i => Number(i.productoId) !== Number(productoId));
    }
  }

  get totalPedido(): number {
    return this.pedido.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  enviarPedido(): void {
    if (this.pedido.length === 0) {
      alert('No hay productos en el pedido');
      return;
    }
  
    if (this.creandoPago) {
      return;
    }
  
    this.creandoPago = true;
  
    const payload = {
      metodoPago: 'MERCADO_PAGO',
      estadoPago: 'PENDIENTE',
      referenciaPago: 'PENDIENTE_MP',
      items: this.pedido.map(i => ({
        productoId: i.productoId,
        cantidad: i.cantidad
      }))
    };
  
    this.pedidoService.crearPedido(payload).subscribe({
      next: (pedidoCreado: any) => {
        if (!pedidoCreado || !pedidoCreado.id) {
          alert('El pedido se creó, pero no se recibió el ID.');
          this.creandoPago = false;
          return;
        }
  
        this.http.post<any>('/api/pagos/crear', {
          pedidoId: pedidoCreado.id,
          total: Number(pedidoCreado.total || this.totalPedido)
        }).subscribe({
          next: (data: any) => {
            if (!data || !data.url) {
              alert('No se recibió la URL de Mercado Pago.');
              this.creandoPago = false;
              return;
            }
  
            this.pedido = [];
            this.creandoPago = false;
  
            window.open(data.url, '_blank');
          },
          error: (error: any) => {
            console.error('Error Mercado Pago:', error);
            alert('Error creando pago. Revisa la consola.');
            this.creandoPago = false;
          }
        });
      },
      error: (error: any) => {
        console.error('Error creando pedido pendiente:', error);
        alert('No se pudo registrar el pedido pendiente.');
        this.creandoPago = false;
      }
    });
  }

  cargarPedidosListos(): void {
    this.pedidoService.listarPedidos().subscribe({
      next: (data) => {
        const listos = (data || []).filter(p => p.estado === 'LISTO');

        listos.forEach(p => {
          if (!this.mostrados.has(Number(p.id))) {
            this.reproducirSonido();
            this.modalPedidoListo = p;
            this.mostrados.add(Number(p.id));
          }
        });

        this.pedidosListos = listos;
      },
      error: (error) => {
        console.error('Error cargando pedidos listos:', error);
      }
    });
  }

  marcarEntregado(id: number): void {
    this.pedidoService.marcarEntregado(id).subscribe({
      next: () => {
        this.mostrados.delete(Number(id));
        this.cargarPedidosListos();
        alert('Pedido entregado correctamente');
      },
      error: (error) => {
        console.error('Error entregando pedido:', error);
        alert('No se pudo marcar como entregado');
      }
    });
  }

  enviarReporteAdministrador(): void {
    if (!this.fechaInicioReporte || !this.fechaFinReporte) {
      alert('Selecciona fecha inicio y fecha fin para generar el reporte');
      return;
    }

    if (this.fechaFinReporte < this.fechaInicioReporte) {
      alert('La fecha fin no puede ser menor que la fecha inicio');
      return;
    }

    this.enviandoReporte = true;

    this.reporteService.enviarReporteAdmin(
      this.fechaInicioReporte,
      this.fechaFinReporte
    ).subscribe({
      next: () => {
        alert('Reporte enviado al administrador por WhatsApp');
        this.enviandoReporte = false;
      },
      error: (error) => {
        console.error('Error enviando reporte:', error);
        alert('No se pudo enviar el reporte');
        this.enviandoReporte = false;
      }
    });
  }

  cerrarSesionCaja(): void {
    this.pedidoService.validarLogoutCaja().subscribe({
      next: (data) => {
        if (!data.puedeCerrarSesion) {
          alert('No puedes cerrar sesión: hay pedidos listos pendientes de entregar.');
          return;
        }

        fetch('/logout', {
          method: 'POST'
        }).then(response => {
          if (response.ok) {
            localStorage.removeItem('usuarioKds');
            window.location.href = '/login';
          }
        });
      },
      error: (error) => {
        console.error(error);
        alert('No se pudo validar el cierre de sesión');
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
}