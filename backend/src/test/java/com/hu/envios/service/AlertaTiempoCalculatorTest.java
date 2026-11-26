package com.hu.envios.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.hu.envios.entity.EstadoEnvio;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class AlertaTiempoCalculatorTest {

    private final AlertaTiempoCalculator calculator = new AlertaTiempoCalculator();

    @Test
    void marcaAdelantadoCuandoFaltanDiasParaLaFechaEstimada() {
        String resultado = calculator.calcular(EstadoEnvio.EN_TRANSITO, LocalDate.now().plusDays(3), LocalDateTime.now());

        assertThat(resultado).isEqualTo("early");
    }

    @Test
    void marcaATiempoCuandoLaFechaEstimadaEsHoy() {
        String resultado = calculator.calcular(EstadoEnvio.EN_REPARTO, LocalDate.now(), LocalDateTime.now());

        assertThat(resultado).isEqualTo("on_time");
    }

    @Test
    void marcaUnDiaDeRetrasoCuandoLaFechaEstimadaFueAyer() {
        String resultado = calculator.calcular(EstadoEnvio.EN_TRANSITO, LocalDate.now().minusDays(1), LocalDateTime.now());

        assertThat(resultado).isEqualTo("delayed_1_day");
    }

    @Test
    void marcaDosDiasDeRetrasoCuandoHayDosOMasDiasDeAtraso() {
        String resultado = calculator.calcular(EstadoEnvio.EN_TRANSITO, LocalDate.now().minusDays(5), LocalDateTime.now());

        assertThat(resultado).isEqualTo("delayed_2_days");
    }

    @Test
    void usaLaFechaDeUltimaActualizacionCuandoElEnvioYaQuedoEntregado() {
        LocalDateTime fechaEntrega = LocalDateTime.now().minusDays(10);
        String resultado = calculator.calcular(EstadoEnvio.ENTREGADO, LocalDate.now().minusDays(10), fechaEntrega);

        assertThat(resultado).isEqualTo("on_time");
    }
}
