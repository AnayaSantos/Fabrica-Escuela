package com.hu.envios.dto;

import java.util.List;

public record VehiculoResponse(
        Long id,
        String placa,
        String conductor,
        String tipo,
        boolean activo,
        List<RutaResumenResponse> rutasHabilitadas
) {
}
