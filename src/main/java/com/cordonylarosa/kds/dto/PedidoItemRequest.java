package com.cordonylarosa.kds.dto;

public record PedidoItemRequest(
        Long productoId,
        Integer cantidad
) {}