package com.hu.envios.dto;

import jakarta.validation.constraints.NotBlank;

public record ActualizarEstadoRequest(@NotBlank String nuevoEstado) {
}
