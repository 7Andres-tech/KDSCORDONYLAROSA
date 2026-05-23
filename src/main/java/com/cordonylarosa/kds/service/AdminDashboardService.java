package com.cordonylarosa.kds.service;

import com.cordonylarosa.kds.dto.AdminDashboardDTO;
import com.cordonylarosa.kds.dto.PlatoVendidoDTO;
import com.cordonylarosa.kds.entity.Pedido;
import com.cordonylarosa.kds.entity.PedidoItem;
import com.cordonylarosa.kds.repository.PedidoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminDashboardService {

    private final PedidoRepository pedidoRepository;

    public AdminDashboardService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    public AdminDashboardDTO obtenerDashboard() {
        LocalDate hoy = LocalDate.now();
        return obtenerDashboardPorFechas(hoy, hoy);
    }

    public AdminDashboardDTO obtenerDashboardPorFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.plusDays(1).atStartOfDay().minusSeconds(1);

        List<Pedido> pedidosRango = pedidoRepository.findAll()
                .stream()
                .filter(p -> p.getCreatedAt() != null)
                .filter(p -> !p.getCreatedAt().isBefore(inicio))
                .filter(p -> !p.getCreatedAt().isAfter(fin))
                .toList();

        List<Pedido> pedidosVenta = pedidosRango.stream()
                .filter(this::esVentaValida)
                .toList();

        BigDecimal ventasTotales = pedidosVenta.stream()
                .map(Pedido::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pedidosCompletados = pedidosVenta.size();

        BigDecimal ticketPromedio = pedidosCompletados > 0
                ? ventasTotales.divide(BigDecimal.valueOf(pedidosCompletados), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new AdminDashboardDTO(
                ventasTotales,
                pedidosCompletados,
                ticketPromedio,
                calcularHoraPico(pedidosVenta),
                calcularPedidosPorEstado(pedidosRango),
                calcularVentasPorHora(pedidosVenta),
                calcularPlatosMasVendidos(pedidosVenta)
        );
    }

    private boolean esVentaValida(Pedido pedido) {
        boolean pagado = pedido.getEstadoPago() != null
                && pedido.getEstadoPago().equalsIgnoreCase("PAGADO");

        boolean entregado = pedido.getEstado() != null
                && pedido.getEstado().name().equalsIgnoreCase("ENTREGADO");

        return pagado || entregado;
    }

    private List<PlatoVendidoDTO> calcularPlatosMasVendidos(List<Pedido> pedidosVenta) {
        Map<String, PlatoAcumulado> acumulados = new HashMap<>();

        for (Pedido pedido : pedidosVenta) {
            for (PedidoItem item : pedido.getItems()) {
                String nombre = item.getNombreProducto();

                if (nombre == null || nombre.isBlank()) {
                    nombre = "Producto sin nombre";
                }

                long cantidad = item.getCantidad() != null ? item.getCantidad() : 0L;
                BigDecimal subtotal = item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;

                PlatoAcumulado actual = acumulados.getOrDefault(
                        nombre,
                        new PlatoAcumulado(0L, BigDecimal.ZERO)
                );

                acumulados.put(
                        nombre,
                        new PlatoAcumulado(
                                actual.cantidad + cantidad,
                                actual.ventas.add(subtotal)
                        )
                );
            }
        }

        return acumulados.entrySet()
                .stream()
                .map(entry -> new PlatoVendidoDTO(
                        entry.getKey(),
                        entry.getValue().cantidad,
                        entry.getValue().ventas
                ))
                .sorted((a, b) -> Long.compare(b.cantidad(), a.cantidad()))
                .limit(10)
                .toList();
    }

    private Map<String, Long> calcularPedidosPorEstado(List<Pedido> pedidosRango) {
        Map<String, Long> estados = new LinkedHashMap<>();
        estados.put("PENDIENTE", 0L);
        estados.put("EN_PREPARACION", 0L);
        estados.put("LISTO", 0L);
        estados.put("ENTREGADO", 0L);

        for (Pedido pedido : pedidosRango) {
            if (pedido.getEstado() == null) continue;

            String estado = pedido.getEstado().name();
            estados.put(estado, estados.getOrDefault(estado, 0L) + 1);
        }

        return estados;
    }

    private Map<Integer, BigDecimal> calcularVentasPorHora(List<Pedido> pedidosVenta) {
        Map<Integer, BigDecimal> ventasPorHora = new TreeMap<>();

        for (int i = 0; i < 24; i++) {
            ventasPorHora.put(i, BigDecimal.ZERO);
        }

        for (Pedido pedido : pedidosVenta) {
            if (pedido.getCreatedAt() != null && pedido.getTotal() != null) {
                int hora = pedido.getCreatedAt().getHour();
                ventasPorHora.put(
                        hora,
                        ventasPorHora.get(hora).add(pedido.getTotal())
                );
            }
        }

        return ventasPorHora;
    }

    private String calcularHoraPico(List<Pedido> pedidosVenta) {
        if (pedidosVenta.isEmpty()) {
            return "Sin datos";
        }

        Map<Integer, Long> pedidosPorHora = new HashMap<>();

        for (Pedido pedido : pedidosVenta) {
            if (pedido.getCreatedAt() != null) {
                int hora = pedido.getCreatedAt().getHour();
                pedidosPorHora.put(hora, pedidosPorHora.getOrDefault(hora, 0L) + 1);
            }
        }

        int horaPico = pedidosPorHora.entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(0);

        return String.format("%02d:00 - %02d:00", horaPico, horaPico + 1);
    }

    private record PlatoAcumulado(
            Long cantidad,
            BigDecimal ventas
    ) {}
}