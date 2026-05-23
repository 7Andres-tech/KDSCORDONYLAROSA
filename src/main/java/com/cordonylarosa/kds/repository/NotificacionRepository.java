package com.cordonylarosa.kds.repository;

import com.cordonylarosa.kds.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findTop10ByOrderByCreatedAtDesc();

    List<Notificacion> findByLeidaFalseOrderByCreatedAtDesc();
}