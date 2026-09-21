package com.hu.envios.dto;

import java.util.List;

public record EnvioRecordResponse(
        String numeroGuia,
        String nombreRemitente,
        String documentoRemitente,
        String telefonoRemitente,
        String direccionOrigen,
        String ciudadOrigen,
        String nombreDestinatario,
        String documentoDestinatario,
        String telefonoDestinatario,
        String direccionDestino,
        String ciudadDestino,
        String peso,
        String tipoServicio,
        String fechaEstimadaEntrega,
        String estadoActual,
        String fechaRegistro,
        String fechaUltimaActualizacion,
        List<EventoLogisticoResponse> eventos
) {
}
