package com.cordonylarosa.kds.dto;

public record ReporteResponse(
        String mensaje,
        String archivo,
        Boolean enviado
) {}