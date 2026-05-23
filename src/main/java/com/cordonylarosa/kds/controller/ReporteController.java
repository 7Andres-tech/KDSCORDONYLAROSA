package com.cordonylarosa.kds.controller;

import com.cordonylarosa.kds.dto.ReporteFechaRequest;
import com.cordonylarosa.kds.dto.ReporteResponse;
import com.cordonylarosa.kds.service.NotificacionService;
import com.cordonylarosa.kds.service.ReportePdfService;
import com.cordonylarosa.kds.service.WhatsAppService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReportePdfService reportePdfService;
    private final WhatsAppService whatsAppService;
    private final NotificacionService notificacionService;

    public ReporteController(ReportePdfService reportePdfService,
                             WhatsAppService whatsAppService,
                             NotificacionService notificacionService) {
        this.reportePdfService = reportePdfService;
        this.whatsAppService = whatsAppService;
        this.notificacionService = notificacionService;
    }

    @PostMapping("/enviar-admin")
    public ResponseEntity<?> enviarReporteAdmin(@RequestBody(required = false) ReporteFechaRequest request) {
        try {
            LocalDate fechaInicio = request != null && request.fechaInicio() != null
                    ? request.fechaInicio()
                    : LocalDate.now();

            LocalDate fechaFin = request != null && request.fechaFin() != null
                    ? request.fechaFin()
                    : fechaInicio;

            if (fechaFin.isBefore(fechaInicio)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "La fecha fin no puede ser menor que la fecha inicio"
                ));
            }

            File reporte = reportePdfService.generarReporte(fechaInicio, fechaFin);

            boolean enviado = whatsAppService.enviarReporteAdministrador(reporte);

            if (enviado) {
                notificacionService.crear(
                        "Ha llegado un nuevo reporte al WhatsApp del " + fechaInicio + " al " + fechaFin
                );
            }

            return ResponseEntity.ok(new ReporteResponse(
                    "Reporte PDF generado y enviado al administrador",
                    reporte.getName(),
                    enviado
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/descargar/{nombreArchivo}")
    public ResponseEntity<Resource> descargarReporte(
            @PathVariable("nombreArchivo") String nombreArchivo) {

        File archivo = new File("reportes", nombreArchivo);

        if (!archivo.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(archivo);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + archivo.getName() + "\""
                )
                .body(resource);
    }
}