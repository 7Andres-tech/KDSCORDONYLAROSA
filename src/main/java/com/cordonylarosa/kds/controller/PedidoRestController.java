package com.cordonylarosa.kds.controller;

import com.cordonylarosa.kds.dto.EstadoPedidoRequest;
import com.cordonylarosa.kds.dto.PedidoRequest;
import com.cordonylarosa.kds.entity.Pedido;
import com.cordonylarosa.kds.service.PedidoService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoRestController {

    private final PedidoService pedidoService;

    public PedidoRestController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Pedido> crearPedido(@RequestBody PedidoRequest request) {
        Pedido pedido = pedidoService.crearPedido(request);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(pedido);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Pedido>> listarPedidos() {
        List<Pedido> pedidos = pedidoService.listarPedidos();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(pedidos);
    }

    @PatchMapping(
            value = "/{id}/estado",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> cambiarEstado(
            @PathVariable("id") Long id,
            @RequestBody EstadoPedidoRequest request
    ) {
        try {
            Pedido pedido = pedidoService.cambiarEstado(id, request.estado());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(pedido);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "id", id,
                    "estadoRecibido", request.estado()
            ));
        }
    }

    @PatchMapping(value = "/{id}/entregar", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> entregar(@PathVariable("id") Long id) {
        try {
            Pedido pedido = pedidoService.marcarEntregado(id);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(pedido);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "id", id
            ));
        }
    }

    @GetMapping(value = "/logout-check/caja", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> logoutCheckCaja() {
        return ResponseEntity.ok(Map.of(
                "puedeCerrarSesion", pedidoService.puedeCerrarSesionCaja()
        ));
    }

    @GetMapping(value = "/logout-check/cocina", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> logoutCheckCocina() {
        return ResponseEntity.ok(Map.of(
                "puedeCerrarSesion", pedidoService.puedeCerrarSesionCocina()
        ));
    }
}