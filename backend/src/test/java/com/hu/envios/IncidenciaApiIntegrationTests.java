package com.hu.envios;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hu.envios.dto.RegistrarEnvioRequest;
import com.hu.envios.service.EnvioService;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "operador@envios.local", authorities = "ROLE_OPERADOR_LOGISTICO")
class IncidenciaApiIntegrationTests {

    private final MockMvc mockMvc;
    private final EnvioService envioService;

    @Autowired
    IncidenciaApiIntegrationTests(MockMvc mockMvc, EnvioService envioService) {
        this.mockMvc = mockMvc;
        this.envioService = envioService;
    }

    @Test
    void registraIncidenciaConEvidenciaYActualizaElEstadoDelEnvio() throws Exception {
        String numeroGuia = crearEnvio("inc-test-1");
        MockMultipartFile evidencia = new MockMultipartFile("evidencia", "foto.jpg", "image/jpeg", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/envios/{numeroGuia}/incidencias", numeroGuia)
                        .file(evidencia)
                        .param("tipo", "Paquete dañado")
                        .param("descripcion", "La caja llego rota"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("CON INCIDENCIA"))
                .andExpect(jsonPath("$.tipoIncidencia").value("Paquete dañado"))
                .andExpect(jsonPath("$.registradoPor").value("operador@envios.local"));
    }

    @Test
    void registraIncidenciaSinEvidencia() throws Exception {
        String numeroGuia = crearEnvio("inc-test-2");

        mockMvc.perform(multipart("/api/envios/{numeroGuia}/incidencias", numeroGuia)
                        .param("tipo", "Otro")
                        .param("descripcion", "Novedad sin foto"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.detalle").value("Novedad sin foto"));
    }

    @Test
    void rechazaTipoDeIncidenciaInvalido() throws Exception {
        String numeroGuia = crearEnvio("inc-test-3");

        mockMvc.perform(multipart("/api/envios/{numeroGuia}/incidencias", numeroGuia)
                        .param("tipo", "Tipo inexistente")
                        .param("descripcion", "Novedad"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void devuelve404CuandoElEnvioNoExiste() throws Exception {
        mockMvc.perform(multipart("/api/envios/{numeroGuia}/incidencias", "LG-INEXISTENTE")
                        .param("tipo", "Otro")
                        .param("descripcion", "Novedad"))
                .andExpect(status().isNotFound());
    }

    private String crearEnvio(String sufijo) {
        var response = envioService.registrar(new RegistrarEnvioRequest(
                "Remitente " + sufijo,
                "100",
                "300",
                "Calle 1",
                "Bogota",
                "Destinatario " + sufijo,
                "200",
                "301",
                "Calle 2",
                "Medellin",
                "1.0",
                "ESTANDAR",
                LocalDate.now().plusDays(10).toString()
        ));
        return response.numeroGuia();
    }
}
