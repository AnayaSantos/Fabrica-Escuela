package com.hu.envios.dto;

import jakarta.validation.constraints.NotBlank;

public record EventoLogisticoRequest(
        @NotBlank String estado,
        @NotBlank String ubicacion,
        String detalle
) {
}
