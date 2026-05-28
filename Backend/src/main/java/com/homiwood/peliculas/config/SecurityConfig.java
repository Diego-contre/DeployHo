package com.homiwood.peliculas.config;

import com.homiwood.peliculas.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults()) // Busca y aplica el Bean de CORS configurado
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. Rutas de autenticación globales
                        .requestMatchers(
                                "/ws/**",
                                "/ws/info/**",
                                "/topic/**",
                                "/app/**",
                                "/api/auth/**",
                                "/api/health"
                        ).permitAll()

                        // 2. CORREGIDO: Abrir todo el catálogo (incluyendo /guardar)
                        .requestMatchers(
                                "/api/catalogo/**"
                        ).permitAll()

                        // 3. CORREGIDO: Abrir las calificaciones para tus pruebas
                        .requestMatchers(
                                "/api/calificaciones/**"
                        ).permitAll()

                        // 4. CORREGIDO: Dar acceso público al endpoint del WebSocket
                        .requestMatchers(
                                "/ws/**"
                        ).permitAll()

                        // Todo lo demás sigue requiriendo token JWT obligatoriamente
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}