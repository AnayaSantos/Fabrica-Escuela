package com.hu.envios.controller;

import com.hu.envios.dto.CentroDistribucionResponse;
import com.hu.envios.dto.RegistrarCentroDistribucionRequest;
import com.hu.envios.service.CentroDistribucionService;
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
@RequestMapping("/api/centros-distribucion")
public class CentroDistribucionController {

    private final CentroDistribucionService centroDistribucionService;

    public CentroDistribucionController(CentroDistribucionService centroDistribucionService) {
        this.centroDistribucionService = centroDistribucionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CentroDistribucionResponse registrar(@Valid @RequestBody RegistrarCentroDistribucionRequest request) {
        return centroDistribucionService.registrar(request);
    }

    @GetMapping
    public List<CentroDistribucionResponse> listar() {
        return centroDistribucionService.listar();
    }

    @GetMapping("/{id}")
    public CentroDistribucionResponse consultar(@PathVariable Long id) {
        return centroDistribucionService.consultar(id);
    }

    @PutMapping("/{id}")
    public CentroDistribucionResponse actualizar(@PathVariable Long id, @Valid @RequestBody RegistrarCentroDistribucionRequest request) {
        return centroDistribucionService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        centroDistribucionService.eliminar(id);
    }
}
