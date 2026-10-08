package com.hu.envios;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hu.envios.dto.RegistrarUsuarioRequest;
import com.hu.envios.exception.RecursoDuplicadoException;
import com.hu.envios.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthApiIntegrationTests {

    private final MockMvc mockMvc;
    private final UsuarioService usuarioService;

    @Autowired
    AuthApiIntegrationTests(MockMvc mockMvc, UsuarioService usuarioService) {
        this.mockMvc = mockMvc;
        this.usuarioService = usuarioService;
    }

    @BeforeEach
    void seedUsuarioOperador() {
        try {
            usuarioService.registrar(new RegistrarUsuarioRequest(
                    "Operador Prueba",
                    "operador.auth.test@envios.local",
                    "ClaveSegura1",
                    "OPERADOR_LOGISTICO"
            ));
        } catch (RecursoDuplicadoException exception) {
            // El contexto de Spring (y la base H2 en memoria) se comparte entre clases de test;
            // si el usuario ya fue creado por una ejecucion previa, el seed es igualmente valido.
        }
    }

    @Test
    void loginConCredencialesValidasDevuelveToken() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "correo": "operador.auth.test@envios.local",
                                  "password": "ClaveSegura1"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tipoToken").value("Bearer"))
                .andExpect(jsonPath("$.rol").value("Operador logistico"));
    }

    @Test
    void loginConPasswordIncorrectaDevuelve401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "correo": "operador.auth.test@envios.local",
                                  "password": "ClaveIncorrecta"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void endpointProtegidoSinTokenDevuelve401() throws Exception {
        mockMvc.perform(get("/api/envios"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "ROLE_OPERADOR_LOGISTICO")
    void endpointSoloAdminConRolIncorrectoDevuelve403() throws Exception {
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isForbidden());
    }
}
