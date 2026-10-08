package com.hu.envios.dto;

public record EventoLogisticoResponse(
        String id,
        long timestamp,
        String fechaHora,
        String estado,
        String ubicacion,
        String detalle
) {
}
