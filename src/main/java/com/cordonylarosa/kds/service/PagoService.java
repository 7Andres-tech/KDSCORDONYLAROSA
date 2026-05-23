package com.cordonylarosa.kds.service;

import com.cordonylarosa.kds.dto.PagoRequest;
import com.cordonylarosa.kds.dto.PagoResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PagoService {

    public PagoResponse procesarPago(PagoRequest request) {

        String metodo = request.metodoPago();

        if (metodo == null || metodo.isBlank()) {
            metodo = "EFECTIVO";
        }

        String referencia = "PAY-" + UUID.randomUUID();

        if (metodo.equalsIgnoreCase("MERCADO_PAGO")) {
            return new PagoResponse(
                    "PENDIENTE",
                    "MERCADO_PAGO",
                    referencia,
                    "/caja/pago-simulado.html?ref=" + referencia
            );
        }

        return new PagoResponse(
                "PAGADO",
                metodo,
                referencia,
                null
        );
    }
}