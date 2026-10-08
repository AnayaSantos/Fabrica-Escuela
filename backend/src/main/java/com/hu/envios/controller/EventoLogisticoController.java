package com.hu.envios.controller;

import com.hu.envios.dto.EnvioRecordResponse;
import com.hu.envios.dto.EventoLogisticoRequest;
import com.hu.envios.dto.EventoLogisticoResponse;
import com.hu.envios.service.EventoLogisticoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/envios/{numeroGuia}/eventos")
public class EventoLogisticoController {

    private final EventoLogisticoService eventoLogisticoService;

    public EventoLogisticoController(EventoLogisticoService eventoLogisticoService) {
        this.eventoLogisticoService = eventoLogisticoService;
    }

    @GetMapping
    public List<EventoLogisticoResponse> listar(@PathVariable String numeroGuia) {
        return eventoLogisticoService.listar(numeroGuia);
    }

    @PostMapping
    public EnvioRecordResponse registrar(
            @PathVariable String numeroGuia,
            @Valid @RequestBody EventoLogisticoRequest request
    ) {
        return eventoLogisticoService.registrar(numeroGuia, request);
    }

    @DeleteMapping("/{eventoId}")
    public EnvioRecordResponse eliminar(@PathVariable String numeroGuia, @PathVariable Long eventoId) {
        return eventoLogisticoService.eliminar(numeroGuia, eventoId);
    }
}
