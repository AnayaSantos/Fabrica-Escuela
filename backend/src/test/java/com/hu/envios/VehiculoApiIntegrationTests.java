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
class VehiculoApiIntegrationTests {

    private final MockMvc mockMvc;

    @Autowired
    VehiculoApiIntegrationTests(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMINISTRADOR")
    void registraVehiculoExitosamente() throws Exception {
        mockMvc.perform(post("/api/vehiculos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "placa": "XYZ-999",
                                  "conductor": "Pedro Prueba",
                                  "tipo": "Furgon"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMINISTRADOR")
    void rechazaPlacaDuplicada() throws Exception {
        String payload = """
                {
                  "placa": "WWW-111",
                  "conductor": "Pedro Prueba",
                  "tipo": "Furgon"
                }
                """;

        mockMvc.perform(post("/api/vehiculos").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/vehiculos").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(authorities = "ROLE_OPERADOR_LOGISTICO")
    void operadorNoPuedeCrearVehiculos() throws Exception {
        mockMvc.perform(post("/api/vehiculos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "placa": "RRR-222",
                                  "conductor": "Pedro Prueba",
                                  "tipo": "Furgon"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_OPERADOR_LOGISTICO")
    void operadorSiPuedeListarVehiculos() throws Exception {
        mockMvc.perform(get("/api/vehiculos"))
                .andExpect(status().isOk());
    }
}
