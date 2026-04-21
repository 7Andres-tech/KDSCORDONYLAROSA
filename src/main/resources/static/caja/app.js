const API_URL = "http://192.168.18.26:8080/api";

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
        console.log("🔊 Audio caja activado");
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
    if (!response.ok) throw new Error("No se pudieron cargar los productos");

    productos = await response.json();
    productosFiltrados = [...productos];

    cargarOpcionesCategorias();
    renderMenu(productosFiltrados);
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

function cargarOpcionesCategorias() {
  const select = document.getElementById("filtro-categoria");
  if (!select) return;

  const categorias = [...new Set(productos.map(p => p.categoria))].sort();

  select.innerHTML = `<option value="">Todas las categorías</option>`;

  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function aplicarFiltros() {
  const texto = document.getElementById("buscador-productos").value.trim().toLowerCase();
  const categoria = document.getElementById("filtro-categoria").value;

  productosFiltrados = productos.filter(prod => {
    const coincideTexto =
      prod.nombre.toLowerCase().includes(texto) ||
      prod.categoria.toLowerCase().includes(texto);

    const coincideCategoria = categoria === "" || prod.categoria === categoria;

    return coincideTexto && coincideCategoria;
  });

  renderMenu(productosFiltrados);
}

function renderMenu(listaProductos) {
  const cont = document.getElementById("menu-productos");
  cont.innerHTML = "";

  const categorias = {};

  listaProductos.forEach(prod => {
    if (!categorias[prod.categoria]) {
      categorias[prod.categoria] = [];
    }
    categorias[prod.categoria].push(prod);
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

      div.innerHTML = `
        <img src="/${prod.imagen}" alt="${prod.nombre}">
        <p><strong>${prod.nombre}</strong></p>
        <span>S/ ${Number(prod.precio).toFixed(2)}</span>
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
  const producto = productos.find(p => p.id === productoId);
  if (!producto) return;

  const existente = pedido.find(i => i.productoId === productoId);

  if (existente) {
    existente.cantidad += 1;
  } else {
    pedido.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      img: producto.imagen,
      cantidad: 1
    });
  }

  renderPedidoActual();
}

function renderPedidoActual() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let total = 0;

  pedido.forEach(i => {
    const subtotal = i.precio * i.cantidad;
    total += subtotal;

    const li = document.createElement("li");
    li.className = "pedido-item";

    li.innerHTML = `
      <img src="/${i.img}" alt="${i.nombre}">
      <div class="pedido-item-info">
        <strong>${i.nombre}</strong>
        <span>Cantidad: ${i.cantidad}</span>
        <span>S/ ${subtotal.toFixed(2)}</span>
      </div>
      <div class="acciones-item">
        <button onclick="sumar(${i.productoId})">+</button>
        <button onclick="restar(${i.productoId})">-</button>
      </div>
    `;

    lista.appendChild(li);
  });

  document.getElementById("total").textContent = total.toFixed(2);
}

function sumar(productoId) {
  const item = pedido.find(i => i.productoId === productoId);
  if (!item) return;
  item.cantidad += 1;
  renderPedidoActual();
}

function restar(productoId) {
  const item = pedido.find(i => i.productoId === productoId);
  if (!item) return;

  item.cantidad -= 1;

  if (item.cantidad <= 0) {
    pedido = pedido.filter(i => i.productoId !== productoId);
  }

  renderPedidoActual();
}

async function enviarPedido() {
  if (pedido.length === 0) {
    alert("No hay productos en el pedido");
    return;
  }

  const payload = {
    items: pedido.map(i => ({
      productoId: i.productoId,
      cantidad: i.cantidad
    }))
  };

  try {
    const response = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("No se pudo enviar el pedido");

    const pedidoCreado = await response.json();
    pedido = [];
    renderPedidoActual();

    alert(`Pedido #${pedidoCreado.id} enviado correctamente`);
  } catch (error) {
    console.error(error);
    alert("Hubo un error al enviar el pedido");
  }
}

/* ========================= */
/* PEDIDOS LISTOS            */
/* ========================= */

async function cargarPedidosListos() {
  try {
    const response = await fetch(`${API_URL}/pedidos`);
    if (!response.ok) throw new Error("No se pudieron cargar los pedidos");

    const data = await response.json();
    const cont = document.getElementById("listos");
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
          <p>Total: S/ ${Number(p.total).toFixed(2)}</p>
          <button class="btn-entregado" onclick="marcarEntregado(${p.id})">Pedido entregado</button>
        `;

        cont.appendChild(div);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function marcarEntregado(id) {
  try {
    const response = await fetch(`${API_URL}/pedidos/${id}/entregar`, {
      method: "PATCH"
    });

    if (!response.ok) throw new Error("No se pudo marcar como entregado");

    await cargarPedidosListos();
  } catch (error) {
    console.error(error);
    alert("No se pudo marcar como entregado");
  }
}

function mostrarModal(pedido) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h2>Pedido #${pedido.id} listo</h2>
      ${pedido.items.map(i => `
        <div class="item">
          <img src="/${i.imagen}" alt="${i.nombreProducto}">
          <span>${i.nombreProducto} x${i.cantidad}</span>
        </div>
      `).join("")}
      <p>Total: S/ ${Number(pedido.total).toFixed(2)}</p>
      <button onclick="this.closest('.modal').remove()">Aceptar</button>
    </div>
  `;

  document.body.appendChild(modal);
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

    const logoutResponse = await fetch("/logout", { method: "POST" });
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
});