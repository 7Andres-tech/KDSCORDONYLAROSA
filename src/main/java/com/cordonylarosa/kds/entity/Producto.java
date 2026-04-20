package com.cordonylarosa.kds.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String categoria;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(length = 255)
    private String imagen;

    @Column(nullable = false)
    private Boolean activo;

    public Producto() {
    }

    public Producto(Long id, String nombre, String categoria, BigDecimal precio, String imagen, Boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.imagen = imagen;
        this.activo = activo;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCategoria() {
        return categoria;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public String getImagen() {
        return imagen;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}