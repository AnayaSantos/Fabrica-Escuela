package com.hu.envios.dto;

import jakarta.validation.constraints.NotNull;

public record AsignarTransporteRequest(
        @NotNull Long rutaId,
        @NotNull Long vehiculoId
) {
}
