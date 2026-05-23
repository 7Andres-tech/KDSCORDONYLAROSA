package com.cordonylarosa.kds.controller;

import com.cordonylarosa.kds.service.MercadoPagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final MercadoPagoService mercadoPagoService;

    public PagoController(MercadoPagoService mercadoPagoService) {
        this.mercadoPagoService = mercadoPagoService;
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearPago(@RequestBody Map<String, Object> body) {

        try {

            BigDecimal total =
                    new BigDecimal(body.get("total").toString());

            String urlPago =
                    mercadoPagoService.crearPago(total);

            return ResponseEntity.ok(
                    Map.of("url", urlPago)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }
}