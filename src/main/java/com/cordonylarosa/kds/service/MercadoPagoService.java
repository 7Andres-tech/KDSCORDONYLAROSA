package com.cordonylarosa.kds.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MercadoPagoService {

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @Value("${app.public-url:http://localhost:8080}")
    private String publicUrl;

    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    public String crearPago(BigDecimal total) throws Exception {

        PreferenceItemRequest item = PreferenceItemRequest.builder()
                .title("Pedido KDS - El Cordón y la Rosa")
                .quantity(1)
                .currencyId("PEN")
                .unitPrice(total)
                .build();

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(publicUrl + "/caja/pago-exitoso.html")
                .failure(publicUrl + "/caja/pago-error.html")
                .pending(publicUrl + "/caja/pago-pendiente.html")
                .build();

        PreferenceRequest request = PreferenceRequest.builder()
                .items(List.of(item))
                .backUrls(backUrls)
                .autoReturn("approved")
                .build();

        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(request);

        return preference.getInitPoint();
    }
}