package com.cordonylarosa.kds.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mensaje;

    private Boolean leida = false;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getMensaje() { return mensaje; }
    public Boolean getLeida() { return leida; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public void setLeida(Boolean leida) { this.leida = leida; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}