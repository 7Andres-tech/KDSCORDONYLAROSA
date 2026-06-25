package com.cordonylarosa.kds.config;

import com.cordonylarosa.kds.repository.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public UserDetailsService userDetailsService(UsuarioRepository usuarioRepository) {
        return username -> usuarioRepository.findByUsernameAndActivoTrue(username)
                .map(u -> new User(
                        u.getUsername(),
                        u.getPassword(),
                        List.of(new SimpleGrantedAuthority(u.getRol()))
                ))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // ===============================
                        // RECURSOS PÚBLICOS DEL FRONTEND ANTIGUO
                        // ===============================
                        .requestMatchers(
                                "/login/**",
                                "/css/**",
                                "/img/**",
                                "/audio/**",
                                "/manifest.json",
                                "/sw.js",
                                "/h2-console/**"
                        ).permitAll()

                        // ===============================
                        // LOGIN ANGULAR
                        // ===============================
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // ===============================
                        // APIs USADAS POR ANGULAR
                        // ===============================
                        .requestMatchers(
                                "/api/productos/**",
                                "/api/pedidos/**",
                                "/api/pagos/**",
                                "/api/reportes/**"
                        ).permitAll()

                        // ===============================
                        // APIs DEL ADMIN
                        // Por ahora permitidas para que Angular Admin funcione
                        // Luego se pueden proteger con ROLE_ADMIN
                        // ===============================
                        .requestMatchers(
                                "/api/admin/**"
                        ).permitAll()

                        // ===============================
                        // VISTAS ANTIGUAS PROTEGIDAS POR ROL
                        // ===============================
                        .requestMatchers("/caja/**").hasRole("CAJERO")
                        .requestMatchers("/cocina/**").hasRole("COCINERO")
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // ===============================
                        // CUALQUIER OTRA RUTA REQUIERE LOGIN
                        // ===============================
                        .anyRequest().authenticated()
                )

                .formLogin(form -> form
                        .loginPage("/login/index.html")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/login/redireccion", true)
                        .failureUrl("/login/index.html?error=true")
                        .permitAll()
                )

                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login/index.html?logout=true")
                        .permitAll()
                )

                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}