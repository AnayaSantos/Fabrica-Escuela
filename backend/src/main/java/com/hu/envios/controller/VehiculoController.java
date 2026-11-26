package com.hu.envios.controller;

import com.hu.envios.dto.RegistrarVehiculoRequest;
import com.hu.envios.dto.VehiculoResponse;
import com.hu.envios.service.VehiculoService;
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
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    private final VehiculoService vehiculoService;

    public VehiculoController(VehiculoService vehiculoService) {
        this.vehiculoService = vehiculoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehiculoResponse registrar(@Valid @RequestBody RegistrarVehiculoRequest request) {
        return vehiculoService.registrar(request);
    }

    @GetMapping
    public List<VehiculoResponse> listar() {
        return vehiculoService.listar();
    }

    @GetMapping("/{id}")
    public VehiculoResponse consultar(@PathVariable Long id) {
        return vehiculoService.consultar(id);
    }

    @PutMapping("/{id}")
    public VehiculoResponse actualizar(@PathVariable Long id, @Valid @RequestBody RegistrarVehiculoRequest request) {
        return vehiculoService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        vehiculoService.eliminar(id);
    }
}
