package com.cordonylarosa.kds.repository;

import com.cordonylarosa.kds.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByActivoTrueOrderByCategoriaAscNombreAsc();
}