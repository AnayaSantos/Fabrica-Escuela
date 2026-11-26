package com.hu.envios.dto;

public record IncidenciaRegistradaResponse(
        String id,
        String fechaHora,
        long timestamp,
        String estado,
        String ubicacion,
        String detalle,
        String tipoIncidencia,
        String registradoPor
) {
}
