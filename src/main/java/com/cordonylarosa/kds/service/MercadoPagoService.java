package com.cordonylarosa.kds.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.payment.Payment;
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

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${app.public-url}")
    private String publicUrl;

    private final PedidoService pedidoService;

    public MercadoPagoService(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    public String crearPago(Long pedidoId, BigDecimal total) throws Exception {

        PreferenceItemRequest item = PreferenceItemRequest.builder()
                .title("Pedido KDS - El Cordón y la Rosa")
                .quantity(1)
                .currencyId("PEN")
                .unitPrice(total)
                .build();

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(frontendUrl + "/pago-exitoso")
                .failure(frontendUrl + "/pago-error")
                .pending(frontendUrl + "/pago-pendiente")
                .build();

        PreferenceRequest request = PreferenceRequest.builder()
                .items(List.of(item))
                .backUrls(backUrls)
                .notificationUrl(publicUrl + "/api/pagos/webhook")
                .externalReference(String.valueOf(pedidoId))
                .build();

        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(request);

        return preference.getInitPoint();
    }

    public void procesarWebhookPago(String paymentId) throws Exception {
        PaymentClient paymentClient = new PaymentClient();
        Payment payment = paymentClient.get(Long.valueOf(paymentId));

        System.out.println("Pago recibido desde Mercado Pago:");
        System.out.println("ID: " + payment.getId());
        System.out.println("Estado: " + payment.getStatus());
        System.out.println("Referencia externa: " + payment.getExternalReference());

        if ("approved".equalsIgnoreCase(payment.getStatus())) {
            Long pedidoId = Long.valueOf(payment.getExternalReference());

            pedidoService.marcarPagoAprobado(
                    pedidoId,
                    String.valueOf(payment.getId())
            );
        }
    }
}