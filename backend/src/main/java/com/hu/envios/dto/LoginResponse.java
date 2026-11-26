package com.hu.envios.dto;

public record LoginResponse(
        String token,
        String tipoToken,
        long expiraEnSegundos,
        String nombre,
        String rol
) {
}
