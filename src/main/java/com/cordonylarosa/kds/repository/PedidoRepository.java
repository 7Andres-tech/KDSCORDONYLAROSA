package com.cordonylarosa.kds.repository;

import com.cordonylarosa.kds.entity.EstadoPedido;
import com.cordonylarosa.kds.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    boolean existsByEstado(EstadoPedido estado);

    boolean existsByEstadoIn(List<EstadoPedido> estados);

    List<Pedido> findByEstadoAndCreatedAtBetween(
            EstadoPedido estado,
            LocalDateTime inicio,
            LocalDateTime fin
    );
}