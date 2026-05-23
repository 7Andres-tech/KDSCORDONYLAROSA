package com.cordonylarosa.kds.dto;

public record PagoResponse(
        String estado,
        String metodoPago,
        String referenciaPago,
        String checkoutUrl
) {}