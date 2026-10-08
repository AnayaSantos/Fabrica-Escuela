package com.hu.envios.service;

import com.hu.envios.dto.AsignacionTransporteResponse;
import com.hu.envios.dto.AsignarTransporteRequest;
import com.hu.envios.entity.AsignacionTransporte;
import com.hu.envios.entity.Envio;
import com.hu.envios.entity.Ruta;
import com.hu.envios.entity.Vehiculo;
import com.hu.envios.exception.RecursoNoEncontradoException;
import com.hu.envios.repository.AsignacionTransporteRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class AsignacionTransporteService {

    private final EnvioService envioService;
    private final RutaService rutaService;
    private final VehiculoService vehiculoService;
    private final AsignacionTransporteRepository asignacionTransporteRepository;
    private final AsignacionTransportePolicy asignacionTransportePolicy;
    private final FechaFormatter fechaFormatter;

    public AsignacionTransporteService(
            EnvioService envioService,
            RutaService rutaService,
            VehiculoService vehiculoService,
            AsignacionTransporteRepository asignacionTransporteRepository,
            AsignacionTransportePolicy asignacionTransportePolicy,
            FechaFormatter fechaFormatter
    ) {
        this.envioService = envioService;
        this.rutaService = rutaService;
        this.vehiculoService = vehiculoService;
        this.asignacionTransporteRepository = asignacionTransporteRepository;
        this.asignacionTransportePolicy = asignacionTransportePolicy;
        this.fechaFormatter = fechaFormatter;
    }

    @Transactional
    public AsignacionTransporteResponse asignar(String numeroGuia, AsignarTransporteRequest request) {
        Envio envio = envioService.buscarPorGuia(numeroGuia);
        asignacionTransportePolicy.validarEstadoAsignable(envio.getEstadoActual());

        Ruta ruta = rutaService.buscarPorId(request.rutaId());
        Vehiculo vehiculo = vehiculoService.buscarPorId(request.vehiculoId());

        AsignacionTransporte asignacion = asignacionTransporteRepository.findByEnvio(envio)
                .map(existente -> {
                    existente.actualizar(ruta, vehiculo);
                    return existente;
                })
                .orElseGet(() -> new AsignacionTransporte(envio, ruta, vehiculo));

        return toResponse(asignacionTransporteRepository.save(asignacion));
    }

    @Transactional
    public AsignacionTransporteResponse consultar(String numeroGuia) {
        Envio envio = envioService.buscarPorGuia(numeroGuia);
        AsignacionTransporte asignacion = asignacionTransporteRepository.findByEnvio(envio)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignacion de transporte", numeroGuia));
        return toResponse(asignacion);
    }

    private AsignacionTransporteResponse toResponse(AsignacionTransporte asignacion) {
        return new AsignacionTransporteResponse(
                asignacion.getEnvio().getNumeroGuia(),
                asignacion.getRuta().getId(),
                asignacion.getRuta().getNombre(),
                asignacion.getVehiculo().getId(),
                asignacion.getVehiculo().getPlaca(),
                fechaFormatter.toDisplay(asignacion.getFechaAsignacion())
        );
    }
}
