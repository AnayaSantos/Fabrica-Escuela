package com.hu.envios.dto;

public record AsignacionTransporteResponse(
        String numeroGuia,
        Long rutaId,
        String rutaNombre,
        Long vehiculoId,
        String vehiculoPlaca,
        String fechaAsignacion
) {
}
