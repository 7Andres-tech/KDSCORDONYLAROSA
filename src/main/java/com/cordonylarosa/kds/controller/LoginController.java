package com.cordonylarosa.kds.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;

@Controller
public class LoginController {

    @GetMapping("/login/redireccion")
    public void redireccion(Authentication auth,
                            HttpServletRequest request,
                            HttpServletResponse response) throws IOException {

        var authorities = auth.getAuthorities();

        if (authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            new DefaultRedirectStrategy().sendRedirect(request, response, "/admin/index.html");
            return;
        }

        if (authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_CAJERO"))) {
            new DefaultRedirectStrategy().sendRedirect(request, response, "/caja/index.html");
            return;
        }

        if (authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_COCINERO"))) {
            new DefaultRedirectStrategy().sendRedirect(request, response, "/cocina/index.html");
            return;
        }

        response.sendRedirect("/login/index.html");
    }
}