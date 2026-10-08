package com.hu.envios.dto;

import java.util.List;

public record DatosGuiaResponse(
        String numeroGuia,
        String estadoActual,
        String remitente,
        String destinatario,
        String origen,
        String destino,
        String fechaEstimadaEntrega,
        List<EventoConsultaResponse> eventos
) {
}
