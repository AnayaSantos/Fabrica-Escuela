package com.hu.envios.dto;

public record EventoConsultaResponse(
        String titulo,
        String fechaHora,
        boolean completado
) {
}
