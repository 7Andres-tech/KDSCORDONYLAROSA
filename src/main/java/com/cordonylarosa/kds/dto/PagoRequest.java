package com.cordonylarosa.kds.dto;

import java.math.BigDecimal;

public record PagoRequest(
        BigDecimal monto,
        String metodoPago
) {}