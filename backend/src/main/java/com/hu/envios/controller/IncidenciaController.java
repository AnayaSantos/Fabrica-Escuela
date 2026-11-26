package com.hu.envios.controller;

import com.hu.envios.dto.IncidenciaRegistradaResponse;
import com.hu.envios.service.IncidenciaService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/envios/{numeroGuia}/incidencias")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

    public IncidenciaController(IncidenciaService incidenciaService) {
        this.incidenciaService = incidenciaService;
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenciaRegistradaResponse registrar(
            @PathVariable String numeroGuia,
            @RequestParam String tipo,
            @RequestParam String descripcion,
            @RequestParam(required = false) MultipartFile evidencia,
            Authentication authentication
    ) {
        String registradoPor = authentication != null ? authentication.getName() : null;
        return incidenciaService.registrar(numeroGuia, tipo, descripcion, evidencia, registradoPor);
    }
}
