const API_URL = "/api";

document.addEventListener("DOMContentLoaded", async () => {
  const pendiente = localStorage.getItem("pedidoPendienteMP");

  if (!pendiente) {
    alert("No hay pedido pendiente");
    window.location.href = "/caja/index.html";
    return;
  }

  const data = JSON.parse(pendiente);

  const response = await fetch(`${API_URL}/pedidos`, {
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

  if (response.ok) {
    const pedido = await response.json();
    localStorage.removeItem("pedidoPendienteMP");
    alert("Pedido #" + pedido.id + " enviado a cocina");
    window.location.href = "/caja/index.html";
  } else {
    alert("Pago aprobado, pero no se pudo registrar el pedido");
  }
});