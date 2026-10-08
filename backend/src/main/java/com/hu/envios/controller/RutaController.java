package com.hu.envios.controller;

import com.hu.envios.dto.RegistrarRutaRequest;
import com.hu.envios.dto.RutaResponse;
import com.hu.envios.service.RutaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rutas")
public class RutaController {

    private final RutaService rutaService;

    public RutaController(RutaService rutaService) {
        this.rutaService = rutaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RutaResponse registrar(@Valid @RequestBody RegistrarRutaRequest request) {
        return rutaService.registrar(request);
    }

    @GetMapping
    public List<RutaResponse> listar() {
        return rutaService.listar();
    }

    @GetMapping("/{id}")
    public RutaResponse consultar(@PathVariable Long id) {
        return rutaService.consultar(id);
    }

    @PutMapping("/{id}")
    public RutaResponse actualizar(@PathVariable Long id, @Valid @RequestBody RegistrarRutaRequest request) {
        return rutaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        rutaService.eliminar(id);
    }
}
