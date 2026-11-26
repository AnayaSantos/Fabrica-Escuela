package com.hu.envios.dto;

public record CentroDistribucionResponse(
        Long id,
        String nombre,
        String ciudad,
        String direccion
) {
}
