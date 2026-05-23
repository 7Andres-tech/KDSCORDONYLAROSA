package com.cordonylarosa.kds.service;

import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URI;
import java.util.List;

@Service
public class WhatsAppService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.whatsapp.from}")
    private String from;

    @Value("${twilio.whatsapp.to}")
    private String to;

    @Value("${app.public-url}")
    private String publicUrl;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
        System.out.println("Twilio inicializado correctamente");
        System.out.println("FROM: " + from);
        System.out.println("TO: " + to);
        System.out.println("PUBLIC URL: " + publicUrl);
    }

    public boolean enviarReporteAdministrador(File archivo) {
        try {
            String mediaUrl = publicUrl + "/api/reportes/descargar/" + archivo.getName();

            System.out.println("Enviando WhatsApp...");
            System.out.println("Archivo: " + archivo.getName());
            System.out.println("Media URL: " + mediaUrl);

            Message message = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(from),
                    "Reporte KDS generado correctamente. Se adjunta el PDF del día."
            )
                    .setMediaUrl(List.of(URI.create(mediaUrl)))
                    .create();

            System.out.println("Mensaje enviado. SID: " + message.getSid());
            System.out.println("Estado Twilio: " + message.getStatus());

            return true;

        } catch (ApiException e) {
            System.out.println("ERROR TWILIO:");
            System.out.println("Código: " + e.getCode());
            System.out.println("Mensaje: " + e.getMessage());
            System.out.println("More info: " + e.getMoreInfo());

            throw new RuntimeException("Error Twilio: " + e.getMessage());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error enviando WhatsApp: " + e.getMessage());
        }
    }
}