package com.hu.envios.dto;

import java.util.List;

public record RutaResponse(
        Long id,
        String nombre,
        Long centroOrigenId,
        String centroOrigenNombre,
        Long centroDestinoId,
        String centroDestinoNombre,
        boolean activa,
        List<ParadaRutaResponse> paradas
) {
}
