package com.cordonylarosa.kds.dto;

public record UsuarioRequest(
        String username,
        String password,
        String rol,
        Boolean activo
) {}