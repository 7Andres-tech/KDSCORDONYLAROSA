package com.cordonylarosa.kds.dto;

import java.math.BigDecimal;

public record PlatoVendidoDTO(
        String plato,
        Long cantidad,
        BigDecimal ventas
) {}