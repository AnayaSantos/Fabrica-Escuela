package com.hu.envios.service;

import com.hu.envios.entity.EstadoEnvio;
import com.hu.envios.exception.AsignacionTransporteNoPermitidaException;
import org.springframework.stereotype.Component;

/**
 * Modelada sobre {@link EstadoTransitionPolicy}: aisla la regla de que solo se puede asignar
 * transporte a un envio en PENDIENTE_RECOLECCION. Esto incluye el caso "en centro de distribucion"
 * de HU-007, que en el modelo actual equivale a PENDIENTE_RECOLECCION (ver TipoEventoLogistico.EN_BODEGA).
 * No se reutiliza EstadoTransitionPolicy porque esa valida transiciones entre dos estados, mientras
 * que aqui se valida un unico estado contra una condicion fija.
 */
@Component
public class AsignacionTransportePolicy {

    public void validarEstadoAsignable(EstadoEnvio estadoActual) {
        if (estadoActual != EstadoEnvio.PENDIENTE_RECOLECCION) {
            throw new AsignacionTransporteNoPermitidaException();
        }
    }
}
