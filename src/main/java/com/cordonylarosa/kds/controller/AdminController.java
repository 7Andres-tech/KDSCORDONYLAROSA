package com.cordonylarosa.kds.controller;

import com.cordonylarosa.kds.dto.AdminDashboardDTO;
import com.cordonylarosa.kds.dto.NotificacionDTO;
import com.cordonylarosa.kds.service.AdminDashboardService;
import com.cordonylarosa.kds.service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminDashboardService adminDashboardService;
    private final NotificacionService notificacionService;

    public AdminController(AdminDashboardService adminDashboardService,
                           NotificacionService notificacionService) {
        this.adminDashboardService = adminDashboardService;
        this.notificacionService = notificacionService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardDTO dashboard() {
        return adminDashboardService.obtenerDashboard();
    }

    @GetMapping("/dashboard/fechas")
public AdminDashboardDTO dashboardPorFechas(
        @RequestParam("fechaInicio") LocalDate fechaInicio,
        @RequestParam("fechaFin") LocalDate fechaFin) {

    return adminDashboardService.obtenerDashboardPorFechas(fechaInicio, fechaFin);
}

    @GetMapping("/notificaciones")
    public List<NotificacionDTO> notificaciones() {
        return notificacionService.listarUltimas();
    }

    @PatchMapping("/notificaciones/leer")
    public ResponseEntity<?> marcarLeidas() {
        notificacionService.marcarLeidas();
        return ResponseEntity.ok().build();
    }
}