package com.hu.envios.service;

import com.hu.envios.dto.ParadaRutaResponse;
import com.hu.envios.dto.RegistrarRutaRequest;
import com.hu.envios.dto.RutaResponse;
import com.hu.envios.entity.CentroDistribucion;
import com.hu.envios.entity.Ruta;
import com.hu.envios.exception.RecursoNoEncontradoException;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.RutaRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RutaService {

    private final RutaRepository rutaRepository;
    private final CentroDistribucionService centroDistribucionService;

    public RutaService(RutaRepository rutaRepository, CentroDistribucionService centroDistribucionService) {
        this.rutaRepository = rutaRepository;
        this.centroDistribucionService = centroDistribucionService;
    }

    @Transactional
    public RutaResponse registrar(RegistrarRutaRequest request) {
        validarOrigenDistintoDeDestino(request);
        CentroDistribucion origen = centroDistribucionService.buscarPorId(request.centroOrigenId());
        CentroDistribucion destino = centroDistribucionService.buscarPorId(request.centroDestinoId());

        Ruta ruta = new Ruta(clean(request.nombre()), origen, destino);
        ruta.reemplazarParadas(resolverParadas(request.paradasIntermediasIds()));

        return toResponse(rutaRepository.save(ruta));
    }

    @Transactional
    public List<RutaResponse> listar() {
        return rutaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RutaResponse consultar(Long id) {
        return toResponse(buscarPorId(id));
    }

    @Transactional
    public RutaResponse actualizar(Long id, RegistrarRutaRequest request) {
        validarOrigenDistintoDeDestino(request);
        Ruta ruta = buscarPorId(id);
        CentroDistribucion origen = centroDistribucionService.buscarPorId(request.centroOrigenId());
        CentroDistribucion destino = centroDistribucionService.buscarPorId(request.centroDestinoId());

        ruta.actualizar(clean(request.nombre()), origen, destino);
        ruta.reemplazarParadas(resolverParadas(request.paradasIntermediasIds()));

        return toResponse(rutaRepository.save(ruta));
    }

    @Transactional
    public void eliminar(Long id) {
        rutaRepository.delete(buscarPorId(id));
    }

    @Transactional
    public Ruta buscarPorId(Long id) {
        return rutaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ruta", String.valueOf(id)));
    }

    private void validarOrigenDistintoDeDestino(RegistrarRutaRequest request) {
        if (request.centroOrigenId() != null && request.centroOrigenId().equals(request.centroDestinoId())) {
            throw new ReglaNegocioException("El origen y el destino no pueden ser el mismo centro de distribucion.");
        }
    }

    private List<CentroDistribucion> resolverParadas(List<Long> paradasIntermediasIds) {
        List<Long> ids = paradasIntermediasIds == null ? List.of() : paradasIntermediasIds;
        return ids.stream().map(centroDistribucionService::buscarPorId).toList();
    }

    private RutaResponse toResponse(Ruta ruta) {
        List<ParadaRutaResponse> paradas = ruta.getParadas()
                .stream()
                .map(parada -> new ParadaRutaResponse(
                        parada.getCentroDistribucion().getId(),
                        parada.getCentroDistribucion().getNombre(),
                        parada.getOrden()
                ))
                .toList();

        return new RutaResponse(
                ruta.getId(),
                ruta.getNombre(),
                ruta.getCentroOrigen().getId(),
                ruta.getCentroOrigen().getNombre(),
                ruta.getCentroDestino().getId(),
                ruta.getCentroDestino().getNombre(),
                ruta.isActiva(),
                paradas
        );
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
