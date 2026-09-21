package com.hu.envios.service;

import com.hu.envios.dto.DatosGuiaResponse;
import com.hu.envios.dto.EnvioRecordResponse;
import com.hu.envios.dto.EventoConsultaResponse;
import com.hu.envios.dto.EventoLogisticoResponse;
import com.hu.envios.entity.Envio;
import com.hu.envios.entity.EventoLogistico;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class EnvioMapper {

    private final FechaFormatter fechaFormatter;

    public EnvioMapper(FechaFormatter fechaFormatter) {
        this.fechaFormatter = fechaFormatter;
    }

    public EnvioRecordResponse toRecord(Envio envio, List<EventoLogistico> eventos) {
        return new EnvioRecordResponse(
                envio.getNumeroGuia(),
                envio.getRemitente().getNombre(),
                envio.getRemitente().getDocumento(),
                envio.getRemitente().getTelefono(),
                envio.getDireccionOrigen().getDireccion(),
                envio.getDireccionOrigen().getCiudad(),
                envio.getDestinatario().getNombre(),
                envio.getDestinatario().getDocumento(),
                envio.getDestinatario().getTelefono(),
                envio.getDireccionDestino().getDireccion(),
                envio.getDireccionDestino().getCiudad(),
                envio.getPesoKg().toPlainString(),
                envio.getTipoServicio().name(),
                envio.getFechaEstimadaEntrega().toString(),
                envio.getEstadoActual().etiqueta(),
                fechaFormatter.toDisplay(envio.getFechaRegistro()),
                fechaFormatter.toDisplay(envio.getFechaUltimaActualizacion()),
                eventos.stream().map(this::toEventoLogistico).toList()
        );
    }

    public DatosGuiaResponse toDatosGuia(Envio envio, List<EventoLogistico> eventos) {
        return new DatosGuiaResponse(
                envio.getNumeroGuia(),
                envio.getEstadoActual().etiqueta(),
                envio.getRemitente().getNombre(),
                envio.getDestinatario().getNombre(),
                envio.getDireccionOrigen().getCiudad(),
                envio.getDireccionDestino().getCiudad(),
                eventos.stream().map(this::toEventoConsulta).toList()
        );
    }

    public EventoLogisticoResponse toEventoLogistico(EventoLogistico evento) {
        return new EventoLogisticoResponse(
                String.valueOf(evento.getId()),
                fechaFormatter.toEpochMillis(evento.getFechaHora()),
                fechaFormatter.toDisplay(evento.getFechaHora()),
                evento.getTipoEvento().etiqueta(),
                evento.getUbicacion(),
                evento.getDetalle()
        );
    }

    private EventoConsultaResponse toEventoConsulta(EventoLogistico evento) {
        return new EventoConsultaResponse(
                evento.getTipoEvento().etiqueta(),
                fechaFormatter.toDisplay(evento.getFechaHora()),
                true
        );
    }
}
