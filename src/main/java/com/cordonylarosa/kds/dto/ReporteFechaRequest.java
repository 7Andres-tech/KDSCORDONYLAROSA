package com.cordonylarosa.kds.dto;

import java.time.LocalDate;

public record ReporteFechaRequest(
        LocalDate fechaInicio,
        LocalDate fechaFin
) {}