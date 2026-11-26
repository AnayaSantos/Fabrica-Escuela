package com.hu.envios.entity;

import com.hu.envios.exception.ReglaNegocioException;
import java.text.Normalizer;
import java.util.Arrays;

public enum TipoIncidencia {
    PAQUETE_DANADO("Paquete dañado"),
    DIRECCION_INCORRECTA("Dirección incorrecta"),
    AUSENCIA_DOMICILIO("Ausencia en domicilio"),
    OTRO("Otro");

    private final String etiqueta;

    TipoIncidencia(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String etiqueta() {
        return etiqueta;
    }

    public static TipoIncidencia fromApiValue(String value) {
        String normalized = normalize(value);
        return Arrays.stream(values())
                .filter(tipo -> normalize(tipo.name()).equals(normalized)
                        || normalize(tipo.etiqueta).equals(normalized))
                .findFirst()
                .orElseThrow(() -> new ReglaNegocioException("Tipo de incidencia no valido."));
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
