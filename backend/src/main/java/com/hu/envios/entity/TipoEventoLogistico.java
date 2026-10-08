package com.hu.envios.entity;

import com.hu.envios.exception.ReglaNegocioException;
import java.text.Normalizer;
import java.util.Arrays;

public enum TipoEventoLogistico {
    CREADO("CREADO", EstadoEnvio.PENDIENTE_RECOLECCION),
    PREPARANDO("PREPARANDO", EstadoEnvio.PENDIENTE_RECOLECCION),
    EN_BODEGA("EN BODEGA", EstadoEnvio.PENDIENTE_RECOLECCION),
    EN_TRANSITO("EN TR\u00c1NSITO", EstadoEnvio.EN_TRANSITO),
    EN_REPARTO("EN REPARTO", EstadoEnvio.EN_REPARTO),
    ENTREGADO("ENTREGADO", EstadoEnvio.ENTREGADO),
    CON_INCIDENCIA("CON INCIDENCIA", EstadoEnvio.CON_INCIDENCIA),
    DEVUELTO("DEVUELTO", EstadoEnvio.DEVUELTO);

    private final String etiqueta;
    private final EstadoEnvio estadoResultante;

    TipoEventoLogistico(String etiqueta, EstadoEnvio estadoResultante) {
        this.etiqueta = etiqueta;
        this.estadoResultante = estadoResultante;
    }

    public String etiqueta() {
        return etiqueta;
    }

    public EstadoEnvio estadoResultante() {
        return estadoResultante;
    }

    public static TipoEventoLogistico fromApiValue(String value) {
        String normalized = normalize(value);
        return Arrays.stream(values())
                .filter(tipo -> normalize(tipo.name()).equals(normalized)
                        || normalize(tipo.etiqueta).equals(normalized))
                .findFirst()
                .orElseThrow(() -> new ReglaNegocioException("Tipo de evento logistico no valido."));
    }

    public static TipoEventoLogistico fromEstado(EstadoEnvio estado) {
        return switch (estado) {
            case PENDIENTE_RECOLECCION -> PREPARANDO;
            case EN_TRANSITO -> EN_TRANSITO;
            case EN_REPARTO -> EN_REPARTO;
            case ENTREGADO -> ENTREGADO;
            case CON_INCIDENCIA -> CON_INCIDENCIA;
            case DEVUELTO -> DEVUELTO;
        };
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('_', ' ')
                .trim()
                .toUpperCase();
    }
}
