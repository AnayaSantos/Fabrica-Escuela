package com.hu.envios.service;

import com.hu.envios.dto.UsuarioResponse;
import com.hu.envios.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    private final FechaFormatter fechaFormatter;

    public UsuarioMapper(FechaFormatter fechaFormatter) {
        this.fechaFormatter = fechaFormatter;
    }

    public UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol().etiqueta(),
                usuario.isActivo(),
                fechaFormatter.toDisplay(usuario.getCreatedAt())
        );
    }
}
