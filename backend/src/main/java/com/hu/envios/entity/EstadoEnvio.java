package com.hu.envios.entity;

import com.hu.envios.exception.ReglaNegocioException;
import java.text.Normalizer;
import java.util.Arrays;

public enum EstadoEnvio {
    PENDIENTE_RECOLECCION("Pendiente de recolecci\u00f3n"),
    EN_TRANSITO("En tr\u00e1nsito"),
    EN_REPARTO("En reparto"),
    ENTREGADO("Entregado"),
    CON_INCIDENCIA("Con incidencia"),
    DEVUELTO("Devuelto");

    private final String etiqueta;

    EstadoEnvio(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String etiqueta() {
        return etiqueta;
    }

    public static EstadoEnvio fromApiValue(String value) {
        String normalized = normalize(value);
        return Arrays.stream(values())
                .filter(estado -> normalize(estado.name()).equals(normalized)
                        || normalize(estado.etiqueta).equals(normalized))
                .findFirst()
                .orElseThrow(() -> new ReglaNegocioException("Estado de envio no valido."));
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
