package com.hu.envios;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hu.envios.dto.CentroDistribucionResponse;
import com.hu.envios.dto.RegistrarCentroDistribucionRequest;
import com.hu.envios.service.CentroDistribucionService;
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
class RutaApiIntegrationTests {

    private final MockMvc mockMvc;
    private final CentroDistribucionService centroDistribucionService;

    @Autowired
    RutaApiIntegrationTests(MockMvc mockMvc, CentroDistribucionService centroDistribucionService) {
        this.mockMvc = mockMvc;
        this.centroDistribucionService = centroDistribucionService;
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMINISTRADOR")
    void registraRutaConParadasRespetandoElOrdenEnvidado() throws Exception {
        Long origenId = crearCentro("Centro Ruta Origen", "Medellin", "Calle 1").id();
        Long destinoId = crearCentro("Centro Ruta Destino", "Bogota", "Calle 2").id();
        Long paradaUno = crearCentro("Centro Ruta Parada 1", "Manizales", "Calle 3").id();
        Long paradaDos = crearCentro("Centro Ruta Parada 2", "Ibague", "Calle 4").id();

        mockMvc.perform(post("/api/rutas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Ruta con paradas",
                                  "centroOrigenId": %d,
                                  "centroDestinoId": %d,
                                  "paradasIntermediasIds": [%d, %d]
                                }
                                """.formatted(origenId, destinoId, paradaUno, paradaDos)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paradas", org.hamcrest.Matchers.hasSize(2)))
                .andExpect(jsonPath("$.paradas[0].centroDistribucionId").value(paradaUno))
                .andExpect(jsonPath("$.paradas[0].orden").value(1))
                .andExpect(jsonPath("$.paradas[1].centroDistribucionId").value(paradaDos))
                .andExpect(jsonPath("$.paradas[1].orden").value(2));
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMINISTRADOR")
    void rechazaOrigenIgualADestino() throws Exception {
        Long centroId = crearCentro("Centro Unico", "Pasto", "Calle 5").id();

        mockMvc.perform(post("/api/rutas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Ruta invalida",
                                  "centroOrigenId": %d,
                                  "centroDestinoId": %d,
                                  "paradasIntermediasIds": []
                                }
                                """.formatted(centroId, centroId)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ROLE_OPERADOR_LOGISTICO")
    void operadorNoPuedeCrearRutas() throws Exception {
        mockMvc.perform(post("/api/rutas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Ruta restringida",
                                  "centroOrigenId": 1,
                                  "centroDestinoId": 2,
                                  "paradasIntermediasIds": []
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_OPERADOR_LOGISTICO")
    void operadorSiPuedeListarRutas() throws Exception {
        mockMvc.perform(get("/api/rutas"))
                .andExpect(status().isOk());
    }

    private CentroDistribucionResponse crearCentro(String nombre, String ciudad, String direccion) {
        return centroDistribucionService.registrar(new RegistrarCentroDistribucionRequest(nombre, ciudad, direccion));
    }
}
