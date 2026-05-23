const API_URL = "/api";

let productos = [];
let productosFiltrados = [];
let pedido = [];
let mostrados = new Set();

let audioActivo = false;
let audio;

/* ========================= */
/* AUDIO AUTOMÁTICO          */
/* ========================= */

document.addEventListener("click", () => {
  if (!audioActivo) {
    audio = new Audio("/audio/audionotificacion.mp3");
    audio.volume = 1;
    audio.preload = "auto";

    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioActivo = true;
        console.log("Audio caja activado");
      })
      .catch(() => {});
  }
}, { once: true });

function reproducirSonido() {
  if (!audioActivo || !audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {
    console.log("Error audio:", e);
  }
}

/* ========================= */
/* PRODUCTOS                 */
/* ========================= */

async function cargarProductos() {
  try {
    const response = await fetch(`${API_URL}/productos`);

    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    productos = await response.json();
    productosFiltrados = [...productos];

    cargarOpcionesCategorias();
    renderMenu(productosFiltrados);

  } catch (error) {
    console.error("Error cargando productos:", error);

    const cont = document.getElementById("menu-productos");
    if (cont) {
      cont.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
  }
}

function cargarOpcionesCategorias() {
  const select = document.getElementById("filtro-categoria");
  if (!select) return;

  const categorias = [
    ...new Set(
      productos
        .map(p => p.categoria)
        .filter(c => c !== null && c !== undefined && c !== "")
    )
  ].sort();

  select.innerHTML = `<option value="">Todas las categorías</option>`;

  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function aplicarFiltros() {
  const buscador = document.getElementById("buscador-productos");
  const filtroCategoria = document.getElementById("filtro-categoria");

  const texto = buscador ? buscador.value.trim().toLowerCase() : "";
  const categoria = filtroCategoria ? filtroCategoria.value : "";

  productosFiltrados = productos.filter(prod => {
    const nombre = prod.nombre ? prod.nombre.toLowerCase() : "";
    const cat = prod.categoria ? prod.categoria.toLowerCase() : "";

    const coincideTexto =
      nombre.includes(texto) ||
      cat.includes(texto);

    const coincideCategoria =
      categoria === "" || prod.categoria === categoria;

    return coincideTexto && coincideCategoria;
  });

  renderMenu(productosFiltrados);
}

function renderMenu(listaProductos) {
  const cont = document.getElementById("menu-productos");
  if (!cont) return;

  cont.innerHTML = "";

  if (!listaProductos || listaProductos.length === 0) {
    cont.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }

  const categorias = {};

  listaProductos.forEach(prod => {
    const categoria = prod.categoria || "Sin categoría";

    if (!categorias[categoria]) {
      categorias[categoria] = [];
    }

    categorias[categoria].push(prod);
  });

  Object.keys(categorias).sort().forEach(categoria => {
    const bloque = document.createElement("div");
    bloque.className = "bloque-categoria";

    const titulo = document.createElement("h3");
    titulo.className = "categoria-titulo";
    titulo.textContent = categoria;

    const grid = document.createElement("div");
    grid.className = "categoria-grid";

    categorias[categoria].forEach(prod => {
      const div = document.createElement("div");
      div.className = "producto";
      div.onclick = () => agregar(prod.id);

      const imagen = prod.imagen ? `/${prod.imagen}` : "/img/default.png";
      const precio = Number(prod.precio || 0).toFixed(2);

      div.innerHTML = `
        <img src="${imagen}" alt="${prod.nombre}">
        <p><strong>${prod.nombre}</strong></p>
        <span>S/ ${precio}</span>
      `;

      grid.appendChild(div);
    });

    bloque.appendChild(titulo);
    bloque.appendChild(grid);
    cont.appendChild(bloque);
  });
}

/* ========================= */
/* PEDIDO ACTUAL             */
/* ========================= */

function agregar(productoId) {
  const producto = productos.find(p => Number(p.id) === Number(productoId));
  if (!producto) return;

  const existente = pedido.find(i => Number(i.productoId) === Number(productoId));

  if (existente) {
    existente.cantidad += 1;
  } else {
    pedido.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio || 0),
      img: producto.imagen,
      cantidad: 1
    });
  }

  renderPedidoActual();
}

function renderPedidoActual() {
  const lista = document.getElementById("lista");
  const totalElement = document.getElementById("total");

  if (!lista || !totalElement) return;

  lista.innerHTML = "";

  let total = 0;

  if (pedido.length === 0) {
    lista.innerHTML = `<li class="pedido-vacio">No hay items en el pedido</li>`;
  }

  pedido.forEach(i => {
    const subtotal = i.precio * i.cantidad;
    total += subtotal;

    const li = document.createElement("li");
    li.className = "pedido-item";

    const imagen = i.img ? `/${i.img}` : "/img/default.png";

    li.innerHTML = `
      <img src="${imagen}" alt="${i.nombre}">
      <div class="pedido-item-info">
        <strong>${i.nombre}</strong>
        <span>Cantidad: ${i.cantidad}</span>
        <span>S/ ${subtotal.toFixed(2)}</span>
      </div>
      <div class="acciones-item">
        <button type="button" onclick="sumar(${i.productoId})">+</button>
        <button type="button" onclick="restar(${i.productoId})">-</button>
      </div>
    `;

    lista.appendChild(li);
  });

  totalElement.textContent = total.toFixed(2);
}

function sumar(productoId) {
  const item = pedido.find(i => Number(i.productoId) === Number(productoId));
  if (!item) return;

  item.cantidad += 1;
  renderPedidoActual();
}

function restar(productoId) {
  const item = pedido.find(i => Number(i.productoId) === Number(productoId));
  if (!item) return;

  item.cantidad -= 1;

  if (item.cantidad <= 0) {
    pedido = pedido.filter(i => Number(i.productoId) !== Number(productoId));
  }

  renderPedidoActual();
}

async function enviarPedido() {
  if (pedido.length === 0) {
    alert("No hay productos en el pedido");
    return;
  }

  const total = pedido.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  try {
    const response = await fetch(`${API_URL}/pagos/crear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        total: total
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error Mercado Pago:", data);
      alert("Error creando pago: " + (data.error || "revisa consola"));
      return;
    }

    localStorage.setItem("pedidoPendienteMP", JSON.stringify({
      items: pedido.map(i => ({
        productoId: i.productoId,
        cantidad: i.cantidad
      }))
    }));

    window.open(data.url, "_blank");

  } catch (error) {
    console.error("Error procesando pago:", error);
    alert("Error procesando el pago. Revisa la consola.");
  }
}

async function registrarPedidoConPago(pago) {
  const payload = {
    metodoPago: pago.metodoPago,
    estadoPago: pago.estado,
    referenciaPago: pago.referenciaPago,
    items: pedido.map(i => ({
      productoId: i.productoId,
      cantidad: i.cantidad
    }))
  };

  const response = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("No se pudo enviar el pedido");
  }

  const pedidoCreado = await response.json();

  pedido = [];
  renderPedidoActual();

  alert(`Pedido #${pedidoCreado.id} enviado correctamente`);
}
/* ========================= */
/* PEDIDOS LISTOS            */
/* ========================= */

async function cargarPedidosListos() {
  try {
    const response = await fetch(`${API_URL}/pedidos`);

    if (!response.ok) {
      throw new Error("No se pudieron cargar los pedidos");
    }

    const data = await response.json();
    const cont = document.getElementById("listos");

    if (!cont) return;

    cont.innerHTML = "";

    data.forEach(p => {
      if (p.estado === "LISTO") {
        if (!mostrados.has(p.id)) {
          reproducirSonido();
          mostrarModal(p);
          mostrados.add(p.id);
        }

        const div = document.createElement("div");
        div.className = "card listo";

        div.innerHTML = `
          <h3>#${p.id}</h3>
          ${p.items.map(i => `
            <div class="item">
              <img src="/${i.imagen}" alt="${i.nombreProducto}">
              <span>${i.nombreProducto} x${i.cantidad}</span>
            </div>
          `).join("")}
          <p>Total: S/ ${Number(p.total || 0).toFixed(2)}</p>
          <button class="btn-entregado" type="button" onclick="marcarEntregado(${p.id})">
            Pedido entregado
          </button>
        `;

        cont.appendChild(div);
      }
    });

  } catch (error) {
    console.error("Error cargando pedidos listos:", error);
  }
}

async function marcarEntregado(id) {
  try {
    const response = await fetch(`${API_URL}/pedidos/${id}/entregar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error entregando:", data);
      alert("No se pudo marcar como entregado: " + (data.error || "Error desconocido"));
      return;
    }

    mostrados.delete(id);
    await cargarPedidosListos();

    alert("Pedido entregado correctamente");

  } catch (error) {
    console.error("Error entregando pedido:", error);
    alert("No se pudo marcar como entregado");
  }
}

function mostrarModal(pedidoListo) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h2>Pedido #${pedidoListo.id} listo</h2>
      ${pedidoListo.items.map(i => `
        <div class="item">
          <img src="/${i.imagen}" alt="${i.nombreProducto}">
          <span>${i.nombreProducto} x${i.cantidad}</span>
        </div>
      `).join("")}
      <p>Total: S/ ${Number(pedidoListo.total || 0).toFixed(2)}</p>
      <button type="button" onclick="this.closest('.modal').remove()">Aceptar</button>
    </div>
  `;

  document.body.appendChild(modal);
}

/* ========================= */
/* REPORTE AL ADMIN          */
/* ========================= */

async function enviarReporteAdministrador(btn) {
  try {
    const fechaInicio = document.getElementById("fechaInicioReporte").value;
    const fechaFin = document.getElementById("fechaFinReporte").value;

    if (!fechaInicio || !fechaFin) {
      alert("Selecciona fecha inicio y fecha fin para generar el reporte");
      return;
    }

    if (fechaFin < fechaInicio) {
      alert("La fecha fin no puede ser menor que la fecha inicio");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando reporte...";

    const response = await fetch(`${API_URL}/reportes/enviar-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Reporte enviado al administrador por WhatsApp");
    } else {
      alert("Error: " + (data.error || "No se pudo enviar el reporte"));
    }

  } catch (error) {
    console.error("Error enviando reporte:", error);
    alert("No se pudo enviar el reporte");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enviar Reporte al Administrador";
  }
}
/* ========================= */
/* LOGOUT                    */
/* ========================= */

async function cerrarSesionCaja() {
  try {
    const response = await fetch(`${API_URL}/pedidos/logout-check/caja`);
    const data = await response.json();

    if (!data.puedeCerrarSesion) {
      alert("No puedes cerrar sesión: hay pedidos listos pendientes de entregar.");
      return;
    }

    const logoutResponse = await fetch("/logout", {
      method: "POST"
    });

    if (logoutResponse.ok) {
      window.location.href = "/login/index.html?logout=true";
    }

  } catch (error) {
    console.error(error);
    alert("No se pudo validar el cierre de sesión");
  }
}

/* ========================= */
/* INICIO                    */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  renderPedidoActual();
  cargarPedidosListos();

  setInterval(cargarPedidosListos, 5000);

  const buscador = document.getElementById("buscador-productos");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const btnReporte = document.getElementById("btnEnviarReporteAdmin");

  if (buscador) {
    buscador.addEventListener("input", aplicarFiltros);
  }

  if (filtroCategoria) {
    filtroCategoria.addEventListener("change", aplicarFiltros);
  }

  if (btnReporte) {
    btnReporte.addEventListener("click", () => enviarReporteAdministrador(btnReporte));
  }
});

  /* ========================= */
  /* RECUPERAR PEDIDO MP       */
  /* ========================= */

  const pedidoPendiente =
    sessionStorage.getItem("pedidoPendiente");

  if (
    pedidoPendiente &&
    window.location.pathname.includes("pago-exitoso")
  ) {

    const data = JSON.parse(pedidoPendiente);

    fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        metodoPago: "MERCADO_PAGO",
        estadoPago: "PAGADO",
        referenciaPago: "MERCADO_PAGO",
        items: data.items
      })
    })
    .then(() => {

      sessionStorage.removeItem("pedidoPendiente");

      alert("Pago realizado correctamente");

      window.location.href = "/caja/index.html";
    });
  }

  async function registrarPedidoPagadoMercadoPago() {
    if (!window.location.pathname.includes("pago-exitoso.html")) {
      return;
    }
  
    const pedidoPendiente = localStorage.getItem("pedidoPendienteMP");
  
    if (!pedidoPendiente) {
      alert("No se encontró pedido pendiente.");
      window.location.href = "/caja/index.html";
      return;
    }
  
    try {
      const data = JSON.parse(pedidoPendiente);
  
      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          metodoPago: "MERCADO_PAGO",
          estadoPago: "PAGADO",
          referenciaPago: "MERCADO_PAGO",
          items: data.items
        })
      });
  
      if (!response.ok) {
        throw new Error("No se pudo registrar el pedido");
      }
  
      const pedidoCreado = await response.json();
  
      localStorage.removeItem("pedidoPendienteMP");
  
      alert("Pago aprobado. Pedido #" + pedidoCreado.id + " enviado a cocina.");
  
      window.location.href = "/caja/index.html";
  
    } catch (error) {
      console.error(error);
      alert("Error registrando el pedido pagado.");
    }
  }
  
  registrarPedidoPagadoMercadoPago();