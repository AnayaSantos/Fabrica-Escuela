package com.hu.envios.dto;

import jakarta.validation.constraints.NotBlank;

public record RegistrarCentroDistribucionRequest(
        @NotBlank String nombre,
        @NotBlank String ciudad,
        @NotBlank String direccion
) {
}
