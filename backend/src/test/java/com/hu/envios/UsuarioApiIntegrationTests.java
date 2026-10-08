package com.hu.envios;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
@WithMockUser(authorities = "ROLE_ADMINISTRADOR")
class UsuarioApiIntegrationTests {

    private final MockMvc mockMvc;

    @Autowired
    UsuarioApiIntegrationTests(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    void registraUsuarioExitosamenteSinExponerPasswordHash() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Carlos Cliente",
                                  "correo": "carlos.usuario.test@envios.local",
                                  "password": "ClaveSegura1",
                                  "rol": "CLIENTE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.correo").value("carlos.usuario.test@envios.local"))
                .andExpect(jsonPath("$.rol").value("Cliente"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void rechazaCorreoDuplicado() throws Exception {
        String payload = """
                {
                  "nombre": "Duplicado Uno",
                  "correo": "duplicado.usuario.test@envios.local",
                  "password": "ClaveSegura1",
                  "rol": "OPERADOR_LOGISTICO"
                }
                """;

        mockMvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isConflict());
    }

    @Test
    void rechazaRolVacio() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Sin Rol",
                                  "correo": "sinrol.usuario.test@envios.local",
                                  "password": "ClaveSegura1",
                                  "rol": ""
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
