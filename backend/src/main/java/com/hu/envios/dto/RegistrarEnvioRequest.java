package com.hu.envios.dto;

import jakarta.validation.constraints.NotBlank;

public record RegistrarEnvioRequest(
        @NotBlank String nombreRemitente,
        @NotBlank String documentoRemitente,
        @NotBlank String telefonoRemitente,
        @NotBlank String direccionOrigen,
        @NotBlank String ciudadOrigen,
        @NotBlank String nombreDestinatario,
        @NotBlank String documentoDestinatario,
        @NotBlank String telefonoDestinatario,
        @NotBlank String direccionDestino,
        @NotBlank String ciudadDestino,
        @NotBlank String peso,
        @NotBlank String tipoServicio,
        @NotBlank String fechaEstimadaEntrega
) {
}
