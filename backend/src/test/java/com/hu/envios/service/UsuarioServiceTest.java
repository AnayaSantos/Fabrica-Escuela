package com.hu.envios.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hu.envios.dto.RegistrarUsuarioRequest;
import com.hu.envios.dto.UsuarioResponse;
import com.hu.envios.entity.RolUsuario;
import com.hu.envios.entity.Usuario;
import com.hu.envios.exception.RecursoDuplicadoException;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

class UsuarioServiceTest {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private UsuarioMapper usuarioMapper;
    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        usuarioMapper = mock(UsuarioMapper.class);

        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(usuarioMapper.toResponse(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario usuario = invocation.getArgument(0);
            return new UsuarioResponse(null, usuario.getNombre(), usuario.getCorreo(), usuario.getRol().etiqueta(), usuario.isActivo(), null);
        });

        usuarioService = new UsuarioService(usuarioRepository, passwordEncoder, usuarioMapper);
    }

    @Test
    void registraUsuarioConRolValidoYPasswordCifrada() {
        when(usuarioRepository.existsByCorreoIgnoreCase("ana@envios.local")).thenReturn(false);
        when(passwordEncoder.encode("ClaveSegura1")).thenReturn("hash-cifrado");

        UsuarioResponse response = usuarioService.registrar(
                new RegistrarUsuarioRequest("Ana Admin", "ana@envios.local", "ClaveSegura1", "ADMINISTRADOR")
        );

        assertThat(response.correo()).isEqualTo("ana@envios.local");
        assertThat(response.rol()).isEqualTo(RolUsuario.ADMINISTRADOR.etiqueta());
        verify(passwordEncoder).encode("ClaveSegura1");
    }

    @Test
    void rechazaCorreoDuplicado() {
        when(usuarioRepository.existsByCorreoIgnoreCase("ana@envios.local")).thenReturn(true);

        RegistrarUsuarioRequest request = new RegistrarUsuarioRequest("Ana Admin", "ana@envios.local", "ClaveSegura1", "ADMINISTRADOR");

        assertThatThrownBy(() -> usuarioService.registrar(request))
                .isInstanceOf(RecursoDuplicadoException.class);
    }

    @Test
    void rechazaRolNoValido() {
        when(usuarioRepository.existsByCorreoIgnoreCase("ana@envios.local")).thenReturn(false);

        RegistrarUsuarioRequest request = new RegistrarUsuarioRequest("Ana Admin", "ana@envios.local", "ClaveSegura1", "SUPERVISOR");

        assertThatThrownBy(() -> usuarioService.registrar(request))
                .isInstanceOf(ReglaNegocioException.class);
    }
}
