package com.cordonylarosa.kds.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AdminDashboardDTO(
        BigDecimal ventasTotales,
        Long pedidosCompletados,
        BigDecimal ticketPromedio,
        String horaPico,
        Map<String, Long> pedidosPorEstado,
        Map<Integer, BigDecimal> ventasPorHora,
        List<PlatoVendidoDTO> platosMasVendidos
) {}