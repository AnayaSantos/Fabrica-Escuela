package com.hu.envios.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String correo,
        @NotBlank String password
) {
}
