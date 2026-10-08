package com.hu.envios;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hu.envios.dto.ActualizarEstadoRequest;
import com.hu.envios.dto.CentroDistribucionResponse;
import com.hu.envios.dto.RegistrarCentroDistribucionRequest;
import com.hu.envios.dto.RegistrarEnvioRequest;
import com.hu.envios.dto.RegistrarRutaRequest;
import com.hu.envios.dto.RegistrarVehiculoRequest;
import com.hu.envios.dto.RutaResponse;
import com.hu.envios.dto.VehiculoResponse;
import com.hu.envios.service.CentroDistribucionService;
import com.hu.envios.service.EnvioService;
import com.hu.envios.service.RutaService;
import com.hu.envios.service.VehiculoService;
import java.time.LocalDate;
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
class AsignacionTransporteApiIntegrationTests {

    private final MockMvc mockMvc;
    private final EnvioService envioService;
    private final CentroDistribucionService centroDistribucionService;
    private final RutaService rutaService;
    private final VehiculoService vehiculoService;

    @Autowired
    AsignacionTransporteApiIntegrationTests(
            MockMvc mockMvc,
            EnvioService envioService,
            CentroDistribucionService centroDistribucionService,
            RutaService rutaService,
            VehiculoService vehiculoService
    ) {
        this.mockMvc = mockMvc;
        this.envioService = envioService;
        this.centroDistribucionService = centroDistribucionService;
        this.rutaService = rutaService;
        this.vehiculoService = vehiculoService;
    }

    @Test
    void asignaTransporteExitosamenteAEnvioPendienteDeRecoleccion() throws Exception {
        String numeroGuia = crearEnvio("asig-test-1");
        Long rutaId = crearRuta("asig-test-1").id();
        Long vehiculoId = crearVehiculo("AAA-111").id();

        mockMvc.perform(post("/api/envios/{numeroGuia}/asignacion-transporte", numeroGuia)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rutaId": %d,
                                  "vehiculoId": %d
                                }
                                """.formatted(rutaId, vehiculoId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroGuia").value(numeroGuia))
                .andExpect(jsonPath("$.vehiculoPlaca").value("AAA-111"));
    }

    @Test
    void bloqueaAsignacionCuandoElEnvioYaFueEntregado() throws Exception {
        String numeroGuia = crearEnvio("asig-test-2");
        Long rutaId = crearRuta("asig-test-2").id();
        Long vehiculoId = crearVehiculo("BBB-222").id();

        envioService.actualizarEstado(numeroGuia, new ActualizarEstadoRequest("En transito"));
        envioService.actualizarEstado(numeroGuia, new ActualizarEstadoRequest("En reparto"));
        envioService.actualizarEstado(numeroGuia, new ActualizarEstadoRequest("Entregado"));

        mockMvc.perform(post("/api/envios/{numeroGuia}/asignacion-transporte", numeroGuia)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rutaId": %d,
                                  "vehiculoId": %d
                                }
                                """.formatted(rutaId, vehiculoId)))
                .andExpect(status().isConflict());
    }

    @Test
    void rechazaCamposVaciosDeRutaYVehiculo() throws Exception {
        String numeroGuia = crearEnvio("asig-test-3");

        mockMvc.perform(post("/api/envios/{numeroGuia}/asignacion-transporte", numeroGuia)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rutaId": null,
                                  "vehiculoId": null
                                }
                                """))
                .andExpect(status().isBadRequest());
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

    private RutaResponse crearRuta(String sufijo) {
        CentroDistribucionResponse origen = centroDistribucionService.registrar(
                new RegistrarCentroDistribucionRequest("Centro Origen " + sufijo, "Bogota", "Calle 1")
        );
        CentroDistribucionResponse destino = centroDistribucionService.registrar(
                new RegistrarCentroDistribucionRequest("Centro Destino " + sufijo, "Medellin", "Calle 2")
        );
        return rutaService.registrar(new RegistrarRutaRequest("Ruta " + sufijo, origen.id(), destino.id(), null));
    }

    private VehiculoResponse crearVehiculo(String placa) {
        return vehiculoService.registrar(new RegistrarVehiculoRequest(placa, "Conductor Prueba", "Furgon"));
    }
}
