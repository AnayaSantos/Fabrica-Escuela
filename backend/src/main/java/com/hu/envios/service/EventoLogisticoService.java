package com.hu.envios.service;

import com.hu.envios.dto.EnvioRecordResponse;
import com.hu.envios.dto.EventoLogisticoRequest;
import com.hu.envios.dto.EventoLogisticoResponse;
import com.hu.envios.entity.Envio;
import com.hu.envios.entity.EventoLogistico;
import com.hu.envios.entity.TipoEventoLogistico;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.EventoLogisticoRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class EventoLogisticoService {

    private final EnvioService envioService;
    private final EventoLogisticoRepository eventoRepository;
    private final EnvioMapper envioMapper;

    public EventoLogisticoService(
            EnvioService envioService,
            EventoLogisticoRepository eventoRepository,
            EnvioMapper envioMapper
    ) {
        this.envioService = envioService;
        this.eventoRepository = eventoRepository;
        this.envioMapper = envioMapper;
    }

    @Transactional
    public List<EventoLogisticoResponse> listar(String numeroGuia) {
        Envio envio = envioService.buscarPorGuia(numeroGuia);
        return eventoRepository.findByEnvioOrderByFechaHoraDesc(envio)
                .stream()
                .map(envioMapper::toEventoLogistico)
                .toList();
    }

    @Transactional
    public EnvioRecordResponse registrar(String numeroGuia, EventoLogisticoRequest request) {
        Envio envio = envioService.buscarPorGuia(numeroGuia);
        TipoEventoLogistico tipoEvento = TipoEventoLogistico.fromApiValue(request.estado());
        validarUbicacion(request.ubicacion());

        envio.actualizarEstado(tipoEvento.estadoResultante());
        eventoRepository.save(new EventoLogistico(
                envio,
                tipoEvento,
                tipoEvento.estadoResultante(),
                request.ubicacion().trim(),
                cleanDetalle(request.detalle())
        ));

        return envioMapper.toRecord(envio, eventoRepository.findByEnvioOrderByFechaHoraDesc(envio));
    }

    @Transactional
    public EnvioRecordResponse eliminar(String numeroGuia, Long eventoId) {
        Envio envio = envioService.buscarPorGuia(numeroGuia);
        EventoLogistico evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ReglaNegocioException("El evento logistico no existe."));

        if (!evento.getEnvio().getId().equals(envio.getId())) {
            throw new ReglaNegocioException("El evento logistico no pertenece a la guia indicada.");
        }

        eventoRepository.delete(evento);
        return envioMapper.toRecord(envio, eventoRepository.findByEnvioOrderByFechaHoraDesc(envio));
    }

    private void validarUbicacion(String ubicacion) {
        if (ubicacion == null || ubicacion.trim().length() < 3 || !ubicacion.matches(".*\\p{L}.*")) {
            throw new ReglaNegocioException("La ubicacion del evento no es valida.");
        }
    }

    private String cleanDetalle(String detalle) {
        if (detalle == null || detalle.isBlank()) {
            return "Novedad atendida";
        }
        return detalle.trim();
    }
}
