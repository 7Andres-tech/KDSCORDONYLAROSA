package com.cordonylarosa.kds.service;

import com.cordonylarosa.kds.dto.AdminDashboardDTO;
import com.cordonylarosa.kds.dto.PlatoVendidoDTO;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;

@Service
public class ReportePdfService {

    private final AdminDashboardService adminDashboardService;

    public ReportePdfService(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    public File generarReporte(LocalDate fechaInicio, LocalDate fechaFin) {

        try {

          AdminDashboardDTO dashboard = adminDashboardService.obtenerDashboardPorFechas(fechaInicio, fechaFin);

            File carpeta = new File("reportes");

            if (!carpeta.exists()) {
                carpeta.mkdirs();
            }

            File archivo = new File(
        carpeta,
        "reporte-" + fechaInicio + "-a-" + fechaFin + ".pdf"
);

            Document document = new Document(
                    PageSize.A4,
                    40,
                    40,
                    40,
                    40
            );

            PdfWriter.getInstance(
                    document,
                    new FileOutputStream(archivo)
            );

            document.open();

            Font tituloFont =
                    new Font(Font.HELVETICA, 22, Font.BOLD, Color.WHITE);

            Font subtituloFont =
                    new Font(Font.HELVETICA, 15, Font.BOLD);

            Font normalFont =
                    new Font(Font.HELVETICA, 11);

            Font boldFont =
                    new Font(Font.HELVETICA, 11, Font.BOLD);

            PdfPTable header = new PdfPTable(1);
            header.setWidthPercentage(100);

            PdfPCell headerCell = new PdfPCell(
                    new Phrase("REPORTE DIARIO DE VENTAS", tituloFont)
            );

            headerCell.setBackgroundColor(new Color(230, 126, 34));
            headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            headerCell.setPadding(18);
            headerCell.setBorder(Rectangle.NO_BORDER);

            header.addCell(headerCell);

            document.add(header);

            Paragraph empresa = new Paragraph(
              "El Cordón y la Rosa - " + fechaInicio + " al " + fechaFin,
                    normalFont
            );

            empresa.setSpacingBefore(12);
            empresa.setSpacingAfter(25);
            empresa.setAlignment(Element.ALIGN_CENTER);

            document.add(empresa);

            document.add(new Paragraph(
                    "Resumen General",
                    subtituloFont
            ));

            document.add(new Paragraph(" "));

            PdfPTable resumen = new PdfPTable(2);

            resumen.setWidthPercentage(100);
            resumen.setSpacingAfter(25);

            resumen.addCell(crearCeldaTitulo("Ventas Totales"));
            resumen.addCell(crearCeldaDato(
                    "S/ " + dashboard.ventasTotales()
            ));

            resumen.addCell(crearCeldaTitulo("Pedidos Completados"));
            resumen.addCell(crearCeldaDato(
                    String.valueOf(dashboard.pedidosCompletados())
            ));

            resumen.addCell(crearCeldaTitulo("Ticket Promedio"));
            resumen.addCell(crearCeldaDato(
                    "S/ " + dashboard.ticketPromedio()
            ));

            resumen.addCell(crearCeldaTitulo("Hora Pico"));
            resumen.addCell(crearCeldaDato(
                    dashboard.horaPico()
            ));

            document.add(resumen);

            document.add(new Paragraph(
                    "Detalle de Platos Vendidos",
                    subtituloFont
            ));

            document.add(new Paragraph(" "));

            PdfPTable tabla = new PdfPTable(3);

            tabla.setWidthPercentage(100);
            tabla.setWidths(new int[]{5, 2, 2});

            tabla.addCell(crearHeaderTabla("Plato"));
            tabla.addCell(crearHeaderTabla("Cantidad"));
            tabla.addCell(crearHeaderTabla("Ventas"));

            for (PlatoVendidoDTO plato : dashboard.platosMasVendidos()) {

                tabla.addCell(crearCeldaTabla(plato.plato()));

                tabla.addCell(crearCeldaTabla(
                        String.valueOf(plato.cantidad())
                ));

                tabla.addCell(crearCeldaTabla(
                        "S/ " + plato.ventas()
                ));
            }

            document.add(tabla);

            document.add(new Paragraph(" "));

            Paragraph footer = new Paragraph(
                    "Reporte generado automáticamente por KDS System",
                    normalFont
            );

            footer.setSpacingBefore(30);
            footer.setAlignment(Element.ALIGN_CENTER);

            document.add(footer);

            document.close();

            return archivo;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Error generando PDF: " + e.getMessage()
            );
        }
    }

    private PdfPCell crearCeldaTitulo(String texto) {

        Font font = new Font(
                Font.HELVETICA,
                11,
                Font.BOLD,
                Color.WHITE
        );

        PdfPCell cell = new PdfPCell(new Phrase(texto, font));

        cell.setBackgroundColor(new Color(52, 73, 94));
        cell.setPadding(10);

        return cell;
    }

    private PdfPCell crearCeldaDato(String texto) {

        Font font = new Font(
                Font.HELVETICA,
                11
        );

        PdfPCell cell = new PdfPCell(new Phrase(texto, font));

        cell.setPadding(10);

        return cell;
    }

    private PdfPCell crearHeaderTabla(String texto) {

        Font font = new Font(
                Font.HELVETICA,
                11,
                Font.BOLD,
                Color.WHITE
        );

        PdfPCell cell = new PdfPCell(
                new Phrase(texto, font)
        );

        cell.setBackgroundColor(new Color(230, 126, 34));
        cell.setPadding(8);

        return cell;
    }

    private PdfPCell crearCeldaTabla(String texto) {

        Font font = new Font(
                Font.HELVETICA,
                10
        );

        PdfPCell cell = new PdfPCell(
                new Phrase(texto, font)
        );

        cell.setPadding(8);

        return cell;
    }
}