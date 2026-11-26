package com.hu.envios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistrarUsuarioRequest(
        @NotBlank String nombre,
        @NotBlank @Email String correo,
        @NotBlank @Size(min = 8, message = "debe tener al menos 8 caracteres") String password,
        @NotBlank String rol
) {
}
