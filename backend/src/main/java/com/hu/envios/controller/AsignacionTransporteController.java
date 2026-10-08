package com.hu.envios.controller;

import com.hu.envios.dto.AsignacionTransporteResponse;
import com.hu.envios.dto.AsignarTransporteRequest;
import com.hu.envios.service.AsignacionTransporteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/envios/{numeroGuia}/asignacion-transporte")
public class AsignacionTransporteController {

    private final AsignacionTransporteService asignacionTransporteService;

    public AsignacionTransporteController(AsignacionTransporteService asignacionTransporteService) {
        this.asignacionTransporteService = asignacionTransporteService;
    }

    @PostMapping
    public AsignacionTransporteResponse asignar(
            @PathVariable String numeroGuia,
            @Valid @RequestBody AsignarTransporteRequest request
    ) {
        return asignacionTransporteService.asignar(numeroGuia, request);
    }

    @GetMapping
    public AsignacionTransporteResponse consultar(@PathVariable String numeroGuia) {
        return asignacionTransporteService.consultar(numeroGuia);
    }
}
