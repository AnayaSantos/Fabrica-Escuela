package com.hu.envios;

import static org.assertj.core.api.Assertions.assertThat;

import com.hu.envios.dto.ActualizarEstadoRequest;
import com.hu.envios.dto.RegistrarEnvioRequest;
import com.hu.envios.dto.RegistrarEnvioResponse;
import com.hu.envios.service.EnvioService;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EnvioServiceIntegrationTests {

    private final EnvioService envioService;

    @Autowired
    EnvioServiceIntegrationTests(EnvioService envioService) {
        this.envioService = envioService;
    }

    @Test
    void registraConsultaYActualizaEnvio() {
        RegistrarEnvioResponse response = envioService.registrar(new RegistrarEnvioRequest(
                "Laura Gomez",
                "1020456789",
                "3005550190",
                "Calle 72 #10-34",
                "Bogota",
                "Carlos Perez",
                "80123456",
                "3105550144",
                "Carrera 43A #7-50",
                "Medellin",
                "2.5",
                "EXPRESS",
                LocalDate.now().plusDays(30).toString()
        ));

        assertThat(response.numeroGuia()).startsWith("LG-");
        var consulta = envioService.consultar(response.numeroGuia());
        assertThat(consulta.numeroGuia()).isEqualTo(response.numeroGuia());
        assertThat(consulta.estadoActual()).isEqualTo("Pendiente de recolecci\u00f3n");

        var updated = envioService.actualizarEstado(response.numeroGuia(), new ActualizarEstadoRequest("En transito"));
        assertThat(updated.estadoActual()).isEqualTo("En tr\u00e1nsito");
        assertThat(updated.eventos()).hasSize(2);
    }
}
