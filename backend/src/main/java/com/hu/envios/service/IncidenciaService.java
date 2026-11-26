package com.hu.envios.service;

import com.hu.envios.dto.IncidenciaRegistradaResponse;
import com.hu.envios.entity.Envio;
import com.hu.envios.entity.EventoLogistico;
import com.hu.envios.entity.Incidencia;
import com.hu.envios.entity.TipoEventoLogistico;
import com.hu.envios.entity.TipoIncidencia;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.EventoLogisticoRepository;
import com.hu.envios.repository.IncidenciaRepository;
import jakarta.transaction.Transactional;
import java.io.IOException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class IncidenciaService {

    private static final String UBICACION_POR_DEFECTO = "Reportado por el operador";
    private static final long TAMANO_MAXIMO_EVIDENCIA = 5L * 1024 * 1024;

    private final EnvioService envioService;
    private final EventoLogisticoRepository eventoRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final FechaFormatter fechaFormatter;

    public IncidenciaService(
            EnvioService envioService,
            EventoLogisticoRepository eventoRepository,
            IncidenciaRepository incidenciaRepository,
            FechaFormatter fechaFormatter
    ) {
        this.envioService = envioService;
        this.eventoRepository = eventoRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.fechaFormatter = fechaFormatter;
    }

    @Transactional
    public IncidenciaRegistradaResponse registrar(
            String numeroGuia,
            String tipoRaw,
            String descripcionRaw,
            MultipartFile evidencia,
            String registradoPor
    ) {
        Envio envio = envioService.buscarPorGuia(numeroGuia);
        TipoIncidencia tipoIncidencia = TipoIncidencia.fromApiValue(tipoRaw);
        String descripcion = validarDescripcion(descripcionRaw);
        byte[] evidenciaBytes = leerEvidencia(evidencia);

        envio.actualizarEstado(TipoEventoLogistico.CON_INCIDENCIA.estadoResultante());
        EventoLogistico evento = eventoRepository.save(new EventoLogistico(
                envio,
                TipoEventoLogistico.CON_INCIDENCIA,
                TipoEventoLogistico.CON_INCIDENCIA.estadoResultante(),
                UBICACION_POR_DEFECTO,
                descripcion
        ));

        Incidencia incidencia = incidenciaRepository.save(new Incidencia(
                envio,
                evento,
                tipoIncidencia,
                descripcion,
                evidenciaBytes,
                evidenciaBytes != null ? evidencia.getOriginalFilename() : null,
                evidenciaBytes != null ? evidencia.getContentType() : null,
                registradoPor
        ));

        return toResponse(evento, incidencia);
    }

    private String validarDescripcion(String descripcion) {
        if (descripcion == null || descripcion.trim().isBlank()) {
            throw new ReglaNegocioException("La descripcion de la incidencia es obligatoria.");
        }
        return descripcion.trim();
    }

    private byte[] leerEvidencia(MultipartFile evidencia) {
        if (evidencia == null || evidencia.isEmpty()) {
            return null;
        }
        if (evidencia.getSize() > TAMANO_MAXIMO_EVIDENCIA) {
            throw new ReglaNegocioException("La evidencia no puede superar 5MB.");
        }
        String contentType = evidencia.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ReglaNegocioException("La evidencia debe ser una imagen.");
        }
        try {
            return evidencia.getBytes();
        } catch (IOException exception) {
            throw new ReglaNegocioException("No se pudo leer el archivo de evidencia.");
        }
    }

    private IncidenciaRegistradaResponse toResponse(EventoLogistico evento, Incidencia incidencia) {
        return new IncidenciaRegistradaResponse(
                String.valueOf(evento.getId()),
                fechaFormatter.toDisplay(evento.getFechaHora()),
                fechaFormatter.toEpochMillis(evento.getFechaHora()),
                evento.getTipoEvento().etiqueta(),
                evento.getUbicacion(),
                evento.getDetalle(),
                incidencia.getTipoIncidencia().etiqueta(),
                incidencia.getRegistradoPor()
        );
    }
}
