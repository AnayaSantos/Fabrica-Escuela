package com.hu.envios.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.hu.envios.entity.EstadoEnvio;
import com.hu.envios.exception.AsignacionTransporteNoPermitidaException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class AsignacionTransportePolicyTest {

    private final AsignacionTransportePolicy policy = new AsignacionTransportePolicy();

    @Test
    void permiteAsignarCuandoElEnvioEstaPendienteDeRecoleccion() {
        assertThatCode(() -> policy.validarEstadoAsignable(EstadoEnvio.PENDIENTE_RECOLECCION))
                .doesNotThrowAnyException();
    }

    @ParameterizedTest
    @EnumSource(value = EstadoEnvio.class, names = "PENDIENTE_RECOLECCION", mode = EnumSource.Mode.EXCLUDE)
    void bloqueaAsignarEnCualquierOtroEstado(EstadoEnvio estado) {
        assertThatThrownBy(() -> policy.validarEstadoAsignable(estado))
                .isInstanceOf(AsignacionTransporteNoPermitidaException.class);
    }
}
