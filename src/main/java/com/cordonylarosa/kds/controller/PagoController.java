package com.cordonylarosa.kds.controller;

import com.cordonylarosa.kds.service.MercadoPagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
public class PagoController {

    private final MercadoPagoService mercadoPagoService;

    public PagoController(MercadoPagoService mercadoPagoService) {
        this.mercadoPagoService = mercadoPagoService;
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearPago(@RequestBody Map<String, Object> body) {
        try {
            Long pedidoId = Long.valueOf(body.get("pedidoId").toString());
            BigDecimal total = new BigDecimal(body.get("total").toString());

            String urlPago = mercadoPagoService.crearPago(pedidoId, total);

            return ResponseEntity.ok(Map.of(
                    "url", urlPago
            ));

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> recibirWebhook(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam Map<String, String> params
    ) {
        try {
            System.out.println("Webhook Mercado Pago recibido");
            System.out.println("Body: " + body);
            System.out.println("Params: " + params);

            String paymentId = null;

            if (body != null && body.get("data") instanceof Map<?, ?> data) {
                Object id = data.get("id");
                if (id != null) {
                    paymentId = id.toString();
                }
            }

            if (paymentId == null && params.get("id") != null) {
                paymentId = params.get("id");
            }

            if (paymentId != null) {
                mercadoPagoService.procesarWebhookPago(paymentId);
            }

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Webhook recibido"
            ));

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.ok(Map.of(
                    "error", e.getMessage()
            ));
        }
    }
}