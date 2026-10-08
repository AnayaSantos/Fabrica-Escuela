package com.hu.envios.controller;

import com.hu.envios.dto.ActualizarEstadoRequest;
import com.hu.envios.dto.DatosGuiaResponse;
import com.hu.envios.dto.EnvioRecordResponse;
import com.hu.envios.dto.RegistrarEnvioRequest;
import com.hu.envios.dto.RegistrarEnvioResponse;
import com.hu.envios.service.EnvioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/envios")
public class EnvioController {

    private final EnvioService envioService;

    public EnvioController(EnvioService envioService) {
        this.envioService = envioService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrarEnvioResponse registrar(@Valid @RequestBody RegistrarEnvioRequest request) {
        return envioService.registrar(request);
    }

    @GetMapping
    public List<EnvioRecordResponse> listar() {
        return envioService.listar();
    }

    @GetMapping("/{numeroGuia}")
    public DatosGuiaResponse consultar(@PathVariable String numeroGuia) {
        return envioService.consultar(numeroGuia);
    }

    @PatchMapping("/{numeroGuia}/estado")
    public EnvioRecordResponse actualizarEstado(
            @PathVariable String numeroGuia,
            @Valid @RequestBody ActualizarEstadoRequest request
    ) {
        return envioService.actualizarEstado(numeroGuia, request);
    }
}
