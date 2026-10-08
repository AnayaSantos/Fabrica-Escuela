package com.hu.envios.dto;

import jakarta.validation.constraints.NotBlank;

public record RegistrarVehiculoRequest(
        @NotBlank String placa,
        @NotBlank String conductor,
        @NotBlank String tipo
) {
}
