package com.hu.envios.service;

import com.hu.envios.dto.RegistrarVehiculoRequest;
import com.hu.envios.dto.RutaResumenResponse;
import com.hu.envios.dto.VehiculoResponse;
import com.hu.envios.entity.Vehiculo;
import com.hu.envios.exception.RecursoDuplicadoException;
import com.hu.envios.exception.RecursoNoEncontradoException;
import com.hu.envios.repository.VehiculoRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;

    public VehiculoService(VehiculoRepository vehiculoRepository) {
        this.vehiculoRepository = vehiculoRepository;
    }

    @Transactional
    public VehiculoResponse registrar(RegistrarVehiculoRequest request) {
        String placa = clean(request.placa()).toUpperCase();
        if (vehiculoRepository.existsByPlacaIgnoreCase(placa)) {
            throw new RecursoDuplicadoException("Ya existe un vehiculo registrado con esa placa.");
        }

        Vehiculo vehiculo = new Vehiculo(placa, clean(request.conductor()), clean(request.tipo()));
        return toResponse(vehiculoRepository.save(vehiculo));
    }

    @Transactional
    public List<VehiculoResponse> listar() {
        return vehiculoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public VehiculoResponse consultar(Long id) {
        return toResponse(buscarPorId(id));
    }

    @Transactional
    public VehiculoResponse actualizar(Long id, RegistrarVehiculoRequest request) {
        Vehiculo vehiculo = buscarPorId(id);
        String placa = clean(request.placa()).toUpperCase();

        if (vehiculoRepository.existsByPlacaIgnoreCaseAndIdNot(placa, id)) {
            throw new RecursoDuplicadoException("Ya existe un vehiculo registrado con esa placa.");
        }

        vehiculo.actualizar(placa, clean(request.conductor()), clean(request.tipo()));
        return toResponse(vehiculoRepository.save(vehiculo));
    }

    @Transactional
    public void eliminar(Long id) {
        vehiculoRepository.delete(buscarPorId(id));
    }

    @Transactional
    public Vehiculo buscarPorId(Long id) {
        return vehiculoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Vehiculo", String.valueOf(id)));
    }

    private VehiculoResponse toResponse(Vehiculo vehiculo) {
        List<RutaResumenResponse> rutas = vehiculo.getRutasHabilitadas()
                .stream()
                .map(ruta -> new RutaResumenResponse(ruta.getId(), ruta.getNombre()))
                .toList();

        return new VehiculoResponse(
                vehiculo.getId(),
                vehiculo.getPlaca(),
                vehiculo.getConductor(),
                vehiculo.getTipo(),
                vehiculo.isActivo(),
                rutas
        );
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
