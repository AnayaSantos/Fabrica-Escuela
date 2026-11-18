package com.hu.envios.service;

import com.hu.envios.entity.EstadoEnvio;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import org.springframework.stereotype.Component;

/**
 * HU-19: calcula el estado de alerta de tiempo de entrega comparando la fecha estimada
 * contra una fecha de referencia (hoy si el envio sigue en curso, o la fecha en que se
 * actualizo por ultima vez si ya quedo en un estado final). No depende de ninguna API
 * externa de clima/ruta: "api_error" queda reservado para fallos internos inesperados.
 */
@Component
public class AlertaTiempoCalculator {

    private static final Set<EstadoEnvio> ESTADOS_FINALES = Set.of(EstadoEnvio.ENTREGADO, EstadoEnvio.DEVUELTO);

    public String calcular(EstadoEnvio estadoActual, LocalDate fechaEstimadaEntrega, LocalDateTime fechaUltimaActualizacion) {
        try {
            LocalDate referencia = ESTADOS_FINALES.contains(estadoActual)
                    ? fechaUltimaActualizacion.toLocalDate()
                    : LocalDate.now();

            long diasRestantes = ChronoUnit.DAYS.between(referencia, fechaEstimadaEntrega);

            if (diasRestantes > 0) {
                return "early";
            }
            if (diasRestantes == 0) {
                return "on_time";
            }
            if (diasRestantes == -1) {
                return "delayed_1_day";
            }
            return "delayed_2_days";
        } catch (RuntimeException exception) {
            return "api_error";
        }
    }
}
