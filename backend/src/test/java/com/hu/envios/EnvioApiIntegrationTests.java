package com.hu.envios;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EnvioApiIntegrationTests {

    private final MockMvc mockMvc;

    @Autowired
    EnvioApiIntegrationTests(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    void flujoRestCompletoParaLasCuatroHu() throws Exception {
        MvcResult registro = mockMvc.perform(post("/api/envios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombreRemitente": "Laura Gomez",
                                  "documentoRemitente": "1020456789",
                                  "telefonoRemitente": "3005550190",
                                  "direccionOrigen": "Calle 72 #10-34",
                                  "ciudadOrigen": "Bogota",
                                  "nombreDestinatario": "Carlos Perez",
                                  "documentoDestinatario": "80123456",
                                  "telefonoDestinatario": "3105550144",
                                  "direccionDestino": "Carrera 43A #7-50",
                                  "ciudadDestino": "Medellin",
                                  "peso": "2.5",
                                  "tipoServicio": "EXPRESS",
                                  "fechaEstimadaEntrega": "2026-09-24"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.numeroGuia", startsWith("LG-")))
                .andReturn();

        String numeroGuia = registro.getResponse()
                .getContentAsString()
                .replaceAll(".*\\\"numeroGuia\\\":\\\"([^\\\"]+)\\\".*", "$1");

        mockMvc.perform(get("/api/envios/{numeroGuia}", numeroGuia))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroGuia").value(numeroGuia))
                .andExpect(jsonPath("$.estadoActual").value("Pendiente de recolecci\u00f3n"))
                .andExpect(jsonPath("$.eventos", hasSize(1)));

        mockMvc.perform(patch("/api/envios/{numeroGuia}/estado", numeroGuia)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nuevoEstado": "En transito"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoActual").value("En tr\u00e1nsito"))
                .andExpect(jsonPath("$.eventos", hasSize(2)));

        mockMvc.perform(post("/api/envios/{numeroGuia}/eventos", numeroGuia)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "estado": "EN BODEGA",
                                  "ubicacion": "Bodega Bogota",
                                  "detalle": "Clasificado"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventos", hasSize(3)));

        mockMvc.perform(get("/api/envios/{numeroGuia}/eventos", numeroGuia))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }
}
