package com.cordonylarosa.kds.service;

import com.cordonylarosa.kds.dto.NotificacionDTO;
import com.cordonylarosa.kds.entity.Notificacion;
import com.cordonylarosa.kds.repository.NotificacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    @Transactional
    public Notificacion crear(String mensaje) {
        Notificacion notificacion = new Notificacion();
        notificacion.setMensaje(mensaje);
        notificacion.setLeida(false);
        return notificacionRepository.save(notificacion);
    }

    @Transactional(readOnly = true)
    public List<NotificacionDTO> listarUltimas() {
        return notificacionRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(n -> new NotificacionDTO(
                        n.getId(),
                        n.getMensaje(),
                        n.getLeida(),
                        n.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public void marcarLeidas() {
        List<Notificacion> notificaciones = notificacionRepository.findByLeidaFalseOrderByCreatedAtDesc();

        for (Notificacion n : notificaciones) {
            n.setLeida(true);
        }

        notificacionRepository.saveAll(notificaciones);
    }
}