package com.hu.envios.config;

import com.hu.envios.security.JwtAccessDeniedHandler;
import com.hu.envios.security.JwtAuthenticationEntryPoint;
import com.hu.envios.security.JwtAuthenticationFilter;
import com.hu.envios.security.JwtService;
import com.hu.envios.security.UsuarioDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String ROL_ADMINISTRADOR = "ADMINISTRADOR";
    private static final String ROL_OPERADOR = "OPERADOR_LOGISTICO";

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(UsuarioDetailsService usuarioDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(usuarioDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            JwtAuthenticationEntryPoint authenticationEntryPoint,
            JwtAccessDeniedHandler accessDeniedHandler
    ) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/envios/*").permitAll()
                        .requestMatchers("/api/usuarios/**").hasRole(ROL_ADMINISTRADOR)
                        .requestMatchers(HttpMethod.GET, "/api/centros-distribucion/**").hasAnyRole(ROL_ADMINISTRADOR, ROL_OPERADOR)
                        .requestMatchers("/api/centros-distribucion/**").hasRole(ROL_ADMINISTRADOR)
                        .requestMatchers(HttpMethod.GET, "/api/rutas/**").hasAnyRole(ROL_ADMINISTRADOR, ROL_OPERADOR)
                        .requestMatchers("/api/rutas/**").hasRole(ROL_ADMINISTRADOR)
                        .requestMatchers(HttpMethod.GET, "/api/vehiculos/**").hasAnyRole(ROL_ADMINISTRADOR, ROL_OPERADOR)
                        .requestMatchers("/api/vehiculos/**").hasRole(ROL_ADMINISTRADOR)
                        .requestMatchers("/api/envios/**").hasAnyRole(ROL_ADMINISTRADOR, ROL_OPERADOR)
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
