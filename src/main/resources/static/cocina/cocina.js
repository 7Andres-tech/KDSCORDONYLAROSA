const API_URL = "/api";

let pedidosPrevios = new Set();
let audioActivo = false;
let audio = null;

/* ========================= */
/* AUDIO                     */
/* ========================= */

function inicializarAudio() {
  if (audioActivo) return;

  audio = new Audio("/audio/audiococina.mp3");
  audio.volume = 1;
  audio.preload = "auto";

  audio.play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audioActivo = true;
      actualizarEstadoAudio();
      console.log("🔊 Audio cocina activado");
    })
    .catch(() => {
      console.log("El navegador bloqueó el audio");
    });
}

function reproducirSonido() {
  if (!audioActivo || !audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(err => console.log(err));
  } catch (e) {
    console.log(e);
  }
}

function actualizarEstadoAudio() {
  const el = document.getElementById("estado-audio");

  if (!el) return;

  el.textContent = audioActivo
    ? "🔊 Sonido activado"
    : "🔇 Activar sonido";
}

/* ========================= */
/* CARGAR PEDIDOS            */
/* ========================= */

async function cargarPedidos() {
  try {
    const response = await fetch(`${API_URL}/pedidos`);

    if (!response.ok) {
      throw new Error("No se pudieron cargar pedidos");
    }

    const data = await response.json();

    renderPedidos(data);

  } catch (error) {
    console.error("Error cargando pedidos:", error);
  }
}

/* ========================= */
/* RENDER                    */
/* ========================= */

function renderPedidos(data) {

  const cont = document.getElementById("pedidos");

  cont.innerHTML = "";

  const pedidosFiltrados = data.filter(p =>
    p.estado === "PENDIENTE" ||
    p.estado === "EN_PREPARACION"
  );

  pedidosFiltrados.sort((a, b) => a.id - b.id);

  pedidosFiltrados.forEach(p => {

    if (!pedidosPrevios.has(p.id)) {
      reproducirSonido();
      pedidosPrevios.add(p.id);
    }

    const claseEstado = obtenerClaseEstado(p);

    const tiempoHTML =
      p.estado === "EN_PREPARACION" && p.inicioPreparacion
        ? `
          <p 
            id="t-${p.id}" 
            class="timer"
            data-inicio="${p.inicioPreparacion}"
          >
            ${formatearTiempo(p.inicioPreparacion)}
          </p>
        `
        : "";

    const div = document.createElement("div");

    div.className = `card ${claseEstado}`;

    div.innerHTML = `
      <h2>#${p.id}</h2>

      ${p.items.map(i => `
        <div class="item">
          <img src="/${i.imagen}" alt="${i.nombreProducto}">
          <span>${i.nombreProducto} x${i.cantidad}</span>
        </div>
      `).join("")}

      ${tiempoHTML}

      <div class="acciones"></div>
    `;

    cont.appendChild(div);

    const acciones = div.querySelector(".acciones");

    if (p.estado === "PENDIENTE") {

      acciones.innerHTML = `
        <button onclick="cambiarEstado(${p.id}, 'EN_PREPARACION')">
          Preparar
        </button>
      `;
    }

    if (p.estado === "EN_PREPARACION") {

      acciones.innerHTML = `
        <button onclick="cambiarEstado(${p.id}, 'LISTO')">
          Pedido listo
        </button>
      `;
    }
  });

  actualizarTimersVisibles();
}

/* ========================= */
/* CLASES                    */
/* ========================= */

function obtenerClaseEstado(pedido) {

  if (pedido.estado === "LISTO") {
    return "listo";
  }

  if (pedido.estado === "EN_PREPARACION") {

    return estaAtrasado(pedido.inicioPreparacion)
      ? "atrasado"
      : "en-preparacion";
  }

  return "pendiente";
}

/* ========================= */
/* TIMER                     */
/* ========================= */

function formatearTiempo(inicioPreparacion) {

  if (!inicioPreparacion) return "00:00";

  const inicio = new Date(inicioPreparacion).getTime();

  const d = Date.now() - inicio;

  const m = String(Math.floor(d / 60000)).padStart(2, "0");

  const s = String(Math.floor((d % 60000) / 1000)).padStart(2, "0");

  return `${m}:${s}`;
}

function actualizarTimersVisibles() {

  const timers = document.querySelectorAll(".timer");

  timers.forEach(timer => {

    const inicio = timer.dataset.inicio;

    timer.textContent = formatearTiempo(inicio);

    const card = timer.closest(".card");

    if (!card) return;

    if (estaAtrasado(inicio)) {

      card.classList.remove("en-preparacion");

      card.classList.add("atrasado");
    }
  });
}

function estaAtrasado(inicioPreparacion) {

  if (!inicioPreparacion) return false;

  const inicio = new Date(inicioPreparacion).getTime();

  return (Date.now() - inicio) > 600000;
}

/* ========================= */
/* CAMBIAR ESTADO            */
/* ========================= */

async function cambiarEstado(id, estado) {

  try {

    const response = await fetch(
      `${API_URL}/pedidos/${id}/estado`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estado: estado
        })
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }

    if (!response.ok) {

      console.error("Error backend:", data);

      alert(
        "Error: " +
        (data.error || "No se pudo cambiar estado")
      );

      return;
    }

    await cargarPedidos();

  } catch (error) {

    console.error("Error frontend:", error);

    alert("No se pudo cambiar el estado");
  }
}

/* ========================= */
/* LOGOUT                    */
/* ========================= */

async function cerrarSesionCocina() {

  try {

    const response = await fetch(
      `${API_URL}/pedidos/logout-check/cocina`
    );

    const data = await response.json();

    if (!data.puedeCerrarSesion) {

      alert(
        "No puedes cerrar sesión: hay pedidos pendientes o en preparación."
      );

      return;
    }

    const logoutResponse = await fetch(
      "/logout",
      {
        method: "POST"
      }
    );

    if (logoutResponse.ok) {

      window.location.href =
        "/login/index.html?logout=true";
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

  const btnAudio = document.getElementById("estado-audio");

  if (btnAudio) {
    btnAudio.addEventListener(
      "click",
      inicializarAudio
    );
  }

  document.addEventListener(
    "click",
    inicializarAudio,
    { once: true }
  );

  actualizarEstadoAudio();

  cargarPedidos();

  setInterval(cargarPedidos, 3000);

  setInterval(actualizarTimersVisibles, 1000);
});