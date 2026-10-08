package com.hu.envios.service;

import com.hu.envios.dto.CentroDistribucionResponse;
import com.hu.envios.dto.RegistrarCentroDistribucionRequest;
import com.hu.envios.entity.CentroDistribucion;
import com.hu.envios.exception.RecursoDuplicadoException;
import com.hu.envios.exception.RecursoNoEncontradoException;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.CentroDistribucionRepository;
import com.hu.envios.repository.ParadaRutaRepository;
import com.hu.envios.repository.RutaRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CentroDistribucionService {

    private final CentroDistribucionRepository centroDistribucionRepository;
    private final RutaRepository rutaRepository;
    private final ParadaRutaRepository paradaRutaRepository;

    public CentroDistribucionService(
            CentroDistribucionRepository centroDistribucionRepository,
            RutaRepository rutaRepository,
            ParadaRutaRepository paradaRutaRepository
    ) {
        this.centroDistribucionRepository = centroDistribucionRepository;
        this.rutaRepository = rutaRepository;
        this.paradaRutaRepository = paradaRutaRepository;
    }

    @Transactional
    public CentroDistribucionResponse registrar(RegistrarCentroDistribucionRequest request) {
        String nombre = clean(request.nombre());
        String ciudad = clean(request.ciudad());
        String direccion = clean(request.direccion());

        if (centroDistribucionRepository.existsByNombreIgnoreCaseAndCiudadIgnoreCaseAndDireccionIgnoreCase(nombre, ciudad, direccion)) {
            throw new RecursoDuplicadoException("Ya existe un centro de distribucion con estos datos en la ciudad seleccionada.");
        }

        CentroDistribucion centro = new CentroDistribucion(nombre, ciudad, direccion);
        return toResponse(centroDistribucionRepository.save(centro));
    }

    @Transactional
    public List<CentroDistribucionResponse> listar() {
        return centroDistribucionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CentroDistribucionResponse consultar(Long id) {
        return toResponse(buscarPorId(id));
    }

    @Transactional
    public CentroDistribucionResponse actualizar(Long id, RegistrarCentroDistribucionRequest request) {
        CentroDistribucion centro = buscarPorId(id);
        String nombre = clean(request.nombre());
        String ciudad = clean(request.ciudad());
        String direccion = clean(request.direccion());

        if (centroDistribucionRepository.existsByNombreIgnoreCaseAndCiudadIgnoreCaseAndDireccionIgnoreCaseAndIdNot(nombre, ciudad, direccion, id)) {
            throw new RecursoDuplicadoException("Ya existe un centro de distribucion con estos datos en la ciudad seleccionada.");
        }

        centro.actualizar(nombre, ciudad, direccion);
        return toResponse(centroDistribucionRepository.save(centro));
    }

    @Transactional
    public void eliminar(Long id) {
        CentroDistribucion centro = buscarPorId(id);

        boolean referenciadoComoOrigenODestino = rutaRepository.existsByCentroOrigenIdOrCentroDestinoId(id, id);
        boolean referenciadoComoParada = paradaRutaRepository.existsByCentroDistribucionId(id);
        if (referenciadoComoOrigenODestino || referenciadoComoParada) {
            throw new ReglaNegocioException("No se puede eliminar un centro de distribucion referenciado por una ruta.");
        }

        centroDistribucionRepository.delete(centro);
    }

    @Transactional
    public CentroDistribucion buscarPorId(Long id) {
        return centroDistribucionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Centro de distribucion", String.valueOf(id)));
    }

    private CentroDistribucionResponse toResponse(CentroDistribucion centro) {
        return new CentroDistribucionResponse(centro.getId(), centro.getNombre(), centro.getCiudad(), centro.getDireccion());
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
