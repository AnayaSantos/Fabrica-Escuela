package com.hu.envios;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class CentroDistribucionApiIntegrationTests {

    private final MockMvc mockMvc;

    @Autowired
    CentroDistribucionApiIntegrationTests(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMINISTRADOR")
    void registraCentroExitosamente() throws Exception {
        mockMvc.perform(post("/api/centros-distribucion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Bodega Sur",
                                  "ciudad": "Medellin",
                                  "direccion": "Calle 50 #20-10"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMINISTRADOR")
    void rechazaCentroDuplicado() throws Exception {
        String payload = """
                {
                  "nombre": "Bodega Duplicada",
                  "ciudad": "Cali",
                  "direccion": "Avenida 5 #30-40"
                }
                """;

        mockMvc.perform(post("/api/centros-distribucion").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/centros-distribucion").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMINISTRADOR")
    void rechazaCamposObligatoriosVacios() throws Exception {
        mockMvc.perform(post("/api/centros-distribucion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Bodega Incompleta",
                                  "ciudad": "",
                                  "direccion": ""
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ROLE_OPERADOR_LOGISTICO")
    void operadorNoPuedeCrearCentros() throws Exception {
        mockMvc.perform(post("/api/centros-distribucion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Bodega Restringida",
                                  "ciudad": "Cartagena",
                                  "direccion": "Calle 1"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_OPERADOR_LOGISTICO")
    void operadorSiPuedeListarCentros() throws Exception {
        mockMvc.perform(get("/api/centros-distribucion"))
                .andExpect(status().isOk());
    }
}
