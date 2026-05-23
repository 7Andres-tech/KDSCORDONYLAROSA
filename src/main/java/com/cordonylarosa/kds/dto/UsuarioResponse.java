package com.cordonylarosa.kds.dto;

public record UsuarioResponse(
        Long id,
        String username,
        String rol,
        Boolean activo
) {}