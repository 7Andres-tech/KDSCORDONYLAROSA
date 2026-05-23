package com.cordonylarosa.kds.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPedido estado;

    @Column(nullable = false)
    private BigDecimal total;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "inicio_preparacion")
    private LocalDateTime inicioPreparacion;

    @Column(name = "metodo_pago")
    private String metodoPago;
    
    @Column(name = "estado_pago")
    private String estadoPago;
    
    @Column(name = "referencia_pago")
    private String referenciaPago;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = EstadoPedido.PENDIENTE;
        }
    }

    public Long getId() {
        return id;
    }

    public EstadoPedido getEstado() {
        return estado;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getInicioPreparacion() {
        return inicioPreparacion;
    }

    public List<PedidoItem> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setEstado(EstadoPedido estado) {
        this.estado = estado;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setInicioPreparacion(LocalDateTime inicioPreparacion) {
        this.inicioPreparacion = inicioPreparacion;
    }

    public void setItems(List<PedidoItem> items) {
        this.items = items;
    }

    public String getMetodoPago() {
        return metodoPago;
    }
    
    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }
    
    public String getEstadoPago() {
        return estadoPago;
    }
    
    public void setEstadoPago(String estadoPago) {
        this.estadoPago = estadoPago;
    }
    
    public String getReferenciaPago() {
        return referenciaPago;
    }
    
    public void setReferenciaPago(String referenciaPago) {
        this.referenciaPago = referenciaPago;
    }
}