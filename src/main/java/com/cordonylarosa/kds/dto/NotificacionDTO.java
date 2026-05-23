package com.cordonylarosa.kds.dto;

import java.time.LocalDateTime;

public record NotificacionDTO(
        Long id,
        String mensaje,
        Boolean leida,
        LocalDateTime createdAt
) {}