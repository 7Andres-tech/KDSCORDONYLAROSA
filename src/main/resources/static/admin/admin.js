let chartVentasHora = null;
let chartEstados = null;
let chartPlatos = null;

document.addEventListener("DOMContentLoaded", () => {
    const hoy = new Date().toISOString().split("T")[0];

    const fechaInicioAdmin = document.getElementById("fechaInicioAdmin");
    const fechaFinAdmin = document.getElementById("fechaFinAdmin");
    const btnFiltrarAdmin = document.getElementById("btnFiltrarAdmin");
    const btnHoyAdmin = document.getElementById("btnHoyAdmin");

    if (fechaInicioAdmin && fechaFinAdmin) {
        fechaInicioAdmin.value = hoy;
        fechaFinAdmin.value = hoy;
    }

    if (btnFiltrarAdmin) {
        btnFiltrarAdmin.addEventListener("click", () => {
            if (!fechaInicioAdmin.value || !fechaFinAdmin.value) {
                alert("Selecciona fecha inicio y fecha fin");
                return;
            }

            if (fechaFinAdmin.value < fechaInicioAdmin.value) {
                alert("La fecha fin no puede ser menor que la fecha inicio");
                return;
            }

            cargarDashboard(fechaInicioAdmin.value, fechaFinAdmin.value);
        });
    }

    if (btnHoyAdmin) {
        btnHoyAdmin.addEventListener("click", () => {
            fechaInicioAdmin.value = hoy;
            fechaFinAdmin.value = hoy;
            cargarDashboard(hoy, hoy);
        });
    }

    const formUsuario = document.getElementById("formUsuario");
    const btnLimpiarUsuario = document.getElementById("btnLimpiarUsuario");

    if (formUsuario) {
        formUsuario.addEventListener("submit", guardarUsuario);
    }

    if (btnLimpiarUsuario) {
        btnLimpiarUsuario.addEventListener("click", limpiarFormularioUsuario);
    }

    cargarDashboard(hoy, hoy);
    cargarUsuarios();
    cargarNotificaciones();

    setInterval(() => {
        cargarNotificaciones();
    }, 5000);
});

/* ========================= */
/* DASHBOARD                 */
/* ========================= */

async function cargarDashboard(fechaInicio = null, fechaFin = null) {
    try {
        let url = "/api/admin/dashboard";

        if (fechaInicio && fechaFin) {
            url = `/api/admin/dashboard/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("No se pudo cargar el dashboard");
        }

        const data = await response.json();

        document.getElementById("ventasTotales").textContent =
            "S/ " + Number(data.ventasTotales || 0).toFixed(2);

        document.getElementById("pedidosCompletados").textContent =
            data.pedidosCompletados || 0;

        document.getElementById("ticketPromedio").textContent =
            "S/ " + Number(data.ticketPromedio || 0).toFixed(2);

        const pedidosEstado = document.getElementById("pedidosEstado");
        if (pedidosEstado) {
            pedidosEstado.innerHTML = `
                <div class="estado-item">
                    <span>Hora pico</span>
                    <span>${data.horaPico || "Sin datos"}</span>
                </div>
            `;
        }

        const tablaPlatos = document.getElementById("tablaPlatos");
        if (tablaPlatos) {
            tablaPlatos.innerHTML = "";

            (data.platosMasVendidos || []).forEach(plato => {
                tablaPlatos.innerHTML += `
                    <tr>
                        <td>${plato.plato}</td>
                        <td>${plato.cantidad}</td>
                        <td>S/ ${Number(plato.ventas || 0).toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        renderGraficos(data);

    } catch (error) {
        console.error("Error cargando dashboard:", error);
    }
}

function renderGraficos(data) {
    if (typeof Chart === "undefined") {
        console.error("Chart.js no está cargado. Revisa que el script esté en admin/index.html");
        return;
    }

    const canvasVentas = document.getElementById("graficoVentasHora");
    const canvasEstados = document.getElementById("graficoEstados");
    const canvasPlatos = document.getElementById("graficoPlatos");

    if (!canvasVentas || !canvasEstados || !canvasPlatos) {
        console.error("No existen los canvas de gráficos en admin/index.html");
        return;
    }

    const ventasHora = data.ventasPorHora || {};
    const estados = data.pedidosPorEstado || {};
    const platos = data.platosMasVendidos || [];

    if (chartVentasHora) chartVentasHora.destroy();
    if (chartEstados) chartEstados.destroy();
    if (chartPlatos) chartPlatos.destroy();

    chartVentasHora = new Chart(canvasVentas, {
        type: "line",
        data: {
            labels: Object.keys(ventasHora).map(h => `${h}:00`),
            datasets: [{
                label: "Ventas por hora S/",
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

    chartEstados = new Chart(canvasEstados, {
        type: "doughnut",
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
                    position: "bottom"
                }
            }
        }
    });

    chartPlatos = new Chart(canvasPlatos, {
        type: "bar",
        data: {
            labels: platos.map(p => p.plato),
            datasets: [{
                label: "Cantidad vendida",
                data: platos.map(p => Number(p.cantidad || 0)),
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

/* ========================= */
/* USUARIOS                  */
/* ========================= */

async function cargarUsuarios() {
    try {
        const response = await fetch("/api/admin/usuarios");

        if (!response.ok) {
            throw new Error("No se pudieron cargar usuarios");
        }

        const usuarios = await response.json();
        const tabla = document.getElementById("tablaUsuarios");

        if (!tabla) {
            console.error("No existe tbody con id tablaUsuarios");
            return;
        }

        tabla.innerHTML = "";

        usuarios.forEach(u => {
            const usernameSeguro = String(u.username).replaceAll("'", "\\'");
            const rolSeguro = String(u.rol).replaceAll("'", "\\'");

            tabla.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.rol}</td>
                    <td>${u.activo ? "Sí" : "No"}</td>
                    <td>
                        <button type="button" onclick="editarUsuario(${u.id}, '${usernameSeguro}', '${rolSeguro}', ${u.activo})">
                            Editar
                        </button>
                        <button type="button" onclick="eliminarUsuario(${u.id})">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error cargando usuarios:", error);
    }
}

async function guardarUsuario(event) {
    event.preventDefault();

    const id = document.getElementById("usuarioId").value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;
    const activo = document.getElementById("activo").value === "true";

    if (!username) {
        alert("Ingresa el nombre de usuario");
        return;
    }

    if (!id && !password) {
        alert("Ingresa una contraseña para el usuario nuevo");
        return;
    }

    const body = {
        username,
        password,
        rol,
        activo
    };

    try {
        const url = id ? `/api/admin/usuarios/${id}` : "/api/admin/usuarios";
        const method = id ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "No se pudo guardar el usuario");
        }

        alert("Usuario guardado correctamente");
        limpiarFormularioUsuario();
        cargarUsuarios();

    } catch (error) {
        console.error("Error guardando usuario:", error);
        alert("Error al guardar usuario");
    }
}

function editarUsuario(id, username, rol, activo) {
    document.getElementById("usuarioId").value = id;
    document.getElementById("username").value = username;
    document.getElementById("password").value = "";
    document.getElementById("rol").value = rol;
    document.getElementById("activo").value = String(activo);
}

async function eliminarUsuario(id) {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
        const response = await fetch(`/api/admin/usuarios/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("No se pudo eliminar el usuario");
        }

        cargarUsuarios();

    } catch (error) {
        console.error("Error eliminando usuario:", error);
        alert("Error al eliminar usuario");
    }
}

function limpiarFormularioUsuario() {
    document.getElementById("usuarioId").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("rol").value = "ROLE_CAJERO";
    document.getElementById("activo").value = "true";
}

/* ========================= */
/* NOTIFICACIONES            */
/* ========================= */

async function cargarNotificaciones() {
    try {
        const listaNotificaciones = document.getElementById("listaNotificaciones");
        const notificacion = document.getElementById("notificacion");

        if (!listaNotificaciones || !notificacion) return;

        const response = await fetch("/api/admin/notificaciones");

        if (!response.ok) {
            throw new Error("No se pudieron cargar notificaciones");
        }

        const data = await response.json();

        listaNotificaciones.innerHTML = "";

        let hayNueva = false;

        data.forEach(n => {
            if (!n.leida) {
                hayNueva = true;
            }

            listaNotificaciones.innerHTML += `
                <div class="notificacion-item">
                    <strong>${n.mensaje}</strong><br>
                    <small>${new Date(n.createdAt).toLocaleString()}</small>
                </div>
            `;
        });

        if (hayNueva) {
            mostrarNotificacion();
            await fetch("/api/admin/notificaciones/leer", {
                method: "PATCH"
            });
        }

    } catch (error) {
        console.error("Error cargando notificaciones:", error);
    }
}

function mostrarNotificacion() {
    const notificacion = document.getElementById("notificacion");

    if (!notificacion) return;

    notificacion.classList.remove("oculto");

    setTimeout(() => {
        notificacion.classList.add("oculto");
    }, 5000);
}