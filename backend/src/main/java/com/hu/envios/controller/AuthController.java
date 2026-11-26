package com.hu.envios.controller;

import com.hu.envios.dto.LoginRequest;
import com.hu.envios.dto.LoginResponse;
import com.hu.envios.entity.Usuario;
import com.hu.envios.repository.UsuarioRepository;
import com.hu.envios.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.correo(), request.password())
        );

        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(request.correo()).orElseThrow();

        return new LoginResponse(
                jwtService.generar(usuario),
                "Bearer",
                jwtService.expiracionEnSegundos(),
                usuario.getNombre(),
                usuario.getRol().etiqueta()
        );
    }
}
