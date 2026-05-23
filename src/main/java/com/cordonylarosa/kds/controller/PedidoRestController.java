package com.cordonylarosa.kds.controller;

import com.cordonylarosa.kds.dto.EstadoPedidoRequest;
import com.cordonylarosa.kds.dto.PedidoRequest;
import com.cordonylarosa.kds.entity.Pedido;
import com.cordonylarosa.kds.service.PedidoService;
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

    @PostMapping
    public Pedido crearPedido(@RequestBody PedidoRequest request) {
        return pedidoService.crearPedido(request);
    }

    @GetMapping
    public List<Pedido> listarPedidos() {
        return pedidoService.listarPedidos();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable("id") Long id,
            @RequestBody EstadoPedidoRequest request
    ) {
        try {
            Pedido pedido = pedidoService.cambiarEstado(id, request.estado());
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "id", id,
                    "estadoRecibido", request.estado()
            ));
        }
    }

    @PatchMapping("/{id}/entregar")
    public ResponseEntity<?> entregar(@PathVariable("id") Long id) {
        try {
            Pedido pedido = pedidoService.marcarEntregado(id);
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "id", id
            ));
        }
    }

    @GetMapping("/logout-check/caja")
    public ResponseEntity<?> logoutCheckCaja() {
        return ResponseEntity.ok(Map.of(
                "puedeCerrarSesion", pedidoService.puedeCerrarSesionCaja()
        ));
    }

    @GetMapping("/logout-check/cocina")
    public ResponseEntity<?> logoutCheckCocina() {
        return ResponseEntity.ok(Map.of(
                "puedeCerrarSesion", pedidoService.puedeCerrarSesionCocina()
        ));
    }
}