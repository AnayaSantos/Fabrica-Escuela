package com.hu.envios.dto;

public record UsuarioResponse(
        Long id,
        String nombre,
        String correo,
        String rol,
        boolean activo,
        String createdAt
) {
}
