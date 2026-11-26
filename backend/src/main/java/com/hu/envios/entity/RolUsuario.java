package com.hu.envios.entity;

import com.hu.envios.exception.ReglaNegocioException;
import java.text.Normalizer;
import java.util.Arrays;

public enum RolUsuario {
    ADMINISTRADOR("Administrador"),
    OPERADOR_LOGISTICO("Operador logistico"),
    CLIENTE("Cliente");

    private final String etiqueta;

    RolUsuario(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String etiqueta() {
        return etiqueta;
    }

    public static RolUsuario fromApiValue(String value) {
        String normalized = normalize(value);
        return Arrays.stream(values())
                .filter(rol -> normalize(rol.name()).equals(normalized)
                        || normalize(rol.etiqueta).equals(normalized))
                .findFirst()
                .orElseThrow(() -> new ReglaNegocioException("Rol de usuario no valido."));
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
