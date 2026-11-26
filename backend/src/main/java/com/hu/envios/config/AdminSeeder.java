package com.hu.envios.config;

import com.hu.envios.entity.RolUsuario;
import com.hu.envios.entity.Usuario;
import com.hu.envios.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String nombre;
    private final String correo;
    private final String password;

    public AdminSeeder(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin-seed.nombre}") String nombre,
            @Value("${app.admin-seed.correo}") String correo,
            @Value("${app.admin-seed.password}") String password
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.nombre = nombre;
        this.correo = correo;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() > 0) {
            return;
        }
        usuarioRepository.save(new Usuario(nombre, correo, passwordEncoder.encode(password), RolUsuario.ADMINISTRADOR));
    }
}
