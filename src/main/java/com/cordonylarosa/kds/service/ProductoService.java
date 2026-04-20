package com.cordonylarosa.kds.service;

import com.cordonylarosa.kds.entity.Producto;
import com.cordonylarosa.kds.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listarProductosActivos() {
        return productoRepository.findByActivoTrueOrderByCategoriaAscNombreAsc();
    }
}