package com.cordonylarosa.kds.config;

import com.cordonylarosa.kds.repository.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/login/**",
                                "/css/**",
                                "/img/**",
                                "/audio/**",
                                "/manifest.json",
                                "/sw.js",
                                "/api/reportes/descargar/**"
                        ).permitAll()
    
                        .requestMatchers("/caja/**").hasRole("CAJERO")
                        .requestMatchers("/cocina/**").hasRole("COCINERO")
                        .requestMatchers("/admin/**").hasRole("ADMIN")
    
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/reportes/**").hasAnyRole("CAJERO", "ADMIN")
                        .requestMatchers("/api/pagos/**").hasAnyRole("CAJERO", "ADMIN")
    
                        .requestMatchers("/api/productos/**").authenticated()
                        .requestMatchers("/api/pedidos/**").authenticated()
                        .requestMatchers("/api/reportes/descargar/**").permitAll()
    
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
                )
                .httpBasic(Customizer.withDefaults());
    
        return http.build();
    }
}