package com.cordonylarosa.kds.repository;

import com.cordonylarosa.kds.entity.PedidoItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {
}