package com.cordonylarosa.kds.dto;

import java.util.List;

public record PedidoRequest(
        List<PedidoItemRequest> items
) {}