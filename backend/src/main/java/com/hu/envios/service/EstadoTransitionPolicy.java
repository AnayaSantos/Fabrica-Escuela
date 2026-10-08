package com.hu.envios.service;

import com.hu.envios.entity.EstadoEnvio;
import com.hu.envios.exception.TransicionEstadoInvalidaException;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class EstadoTransitionPolicy {

    private final Map<EstadoEnvio, List<EstadoEnvio>> transiciones = new EnumMap<>(EstadoEnvio.class);

    public EstadoTransitionPolicy() {
        transiciones.put(EstadoEnvio.PENDIENTE_RECOLECCION, List.of(EstadoEnvio.EN_TRANSITO, EstadoEnvio.CON_INCIDENCIA));
        transiciones.put(EstadoEnvio.EN_TRANSITO, List.of(EstadoEnvio.EN_REPARTO, EstadoEnvio.CON_INCIDENCIA, EstadoEnvio.DEVUELTO));
        transiciones.put(EstadoEnvio.EN_REPARTO, List.of(EstadoEnvio.ENTREGADO, EstadoEnvio.CON_INCIDENCIA, EstadoEnvio.DEVUELTO));
        transiciones.put(EstadoEnvio.ENTREGADO, List.of());
        transiciones.put(EstadoEnvio.CON_INCIDENCIA, List.of(EstadoEnvio.EN_TRANSITO, EstadoEnvio.EN_REPARTO, EstadoEnvio.DEVUELTO));
        transiciones.put(EstadoEnvio.DEVUELTO, List.of());
    }

    public void validar(EstadoEnvio estadoActual, EstadoEnvio nuevoEstado) {
        if (!transiciones.getOrDefault(estadoActual, List.of()).contains(nuevoEstado)) {
            throw new TransicionEstadoInvalidaException();
        }
    }
}
