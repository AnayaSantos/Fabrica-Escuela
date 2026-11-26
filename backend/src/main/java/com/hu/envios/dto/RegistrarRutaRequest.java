package com.hu.envios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RegistrarRutaRequest(
        @NotBlank String nombre,
        @NotNull Long centroOrigenId,
        @NotNull Long centroDestinoId,
        List<Long> paradasIntermediasIds
) {
}
