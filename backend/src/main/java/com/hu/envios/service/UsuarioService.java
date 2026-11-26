package com.hu.envios.service;

import com.hu.envios.dto.RegistrarUsuarioRequest;
import com.hu.envios.dto.UsuarioResponse;
import com.hu.envios.entity.RolUsuario;
import com.hu.envios.entity.Usuario;
import com.hu.envios.exception.RecursoDuplicadoException;
import com.hu.envios.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, UsuarioMapper usuarioMapper) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioMapper = usuarioMapper;
    }

    @Transactional
    public UsuarioResponse registrar(RegistrarUsuarioRequest request) {
        String correo = clean(request.correo());
        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            throw new RecursoDuplicadoException("Ya existe un usuario registrado con ese correo.");
        }

        RolUsuario rol = RolUsuario.fromApiValue(request.rol());
        Usuario usuario = new Usuario(
                clean(request.nombre()),
                correo,
                passwordEncoder.encode(request.password()),
                rol
        );

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(usuarioMapper::toResponse)
                .toList();
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
