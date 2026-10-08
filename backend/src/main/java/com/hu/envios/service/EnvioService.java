package com.hu.envios.service;

import com.hu.envios.dto.ActualizarEstadoRequest;
import com.hu.envios.dto.DatosGuiaResponse;
import com.hu.envios.dto.EnvioRecordResponse;
import com.hu.envios.dto.RegistrarEnvioRequest;
import com.hu.envios.dto.RegistrarEnvioResponse;
import com.hu.envios.entity.Contacto;
import com.hu.envios.entity.Direccion;
import com.hu.envios.entity.Envio;
import com.hu.envios.entity.EstadoEnvio;
import com.hu.envios.entity.EventoLogistico;
import com.hu.envios.entity.TipoEventoLogistico;
import com.hu.envios.entity.TipoServicio;
import com.hu.envios.exception.EnvioNoEncontradoException;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.ContactoRepository;
import com.hu.envios.repository.DireccionRepository;
import com.hu.envios.repository.EnvioRepository;
import com.hu.envios.repository.EventoLogisticoRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class EnvioService {

    private final ContactoRepository contactoRepository;
    private final DireccionRepository direccionRepository;
    private final EnvioRepository envioRepository;
    private final EventoLogisticoRepository eventoRepository;
    private final NumeroGuiaService numeroGuiaService;
    private final EstadoTransitionPolicy transitionPolicy;
    private final EnvioMapper envioMapper;

    public EnvioService(
            ContactoRepository contactoRepository,
            DireccionRepository direccionRepository,
            EnvioRepository envioRepository,
            EventoLogisticoRepository eventoRepository,
            NumeroGuiaService numeroGuiaService,
            EstadoTransitionPolicy transitionPolicy,
            EnvioMapper envioMapper
    ) {
        this.contactoRepository = contactoRepository;
        this.direccionRepository = direccionRepository;
        this.envioRepository = envioRepository;
        this.eventoRepository = eventoRepository;
        this.numeroGuiaService = numeroGuiaService;
        this.transitionPolicy = transitionPolicy;
        this.envioMapper = envioMapper;
    }

    @Transactional
    public RegistrarEnvioResponse registrar(RegistrarEnvioRequest request) {
        BigDecimal pesoKg = parsePeso(request.peso());
        TipoServicio tipoServicio = parseTipoServicio(request.tipoServicio());
        LocalDate fechaEstimada = parseFecha(request.fechaEstimadaEntrega());

        Contacto remitente = contactoRepository.save(new Contacto(
                clean(request.nombreRemitente()),
                clean(request.documentoRemitente()),
                clean(request.telefonoRemitente())
        ));
        Contacto destinatario = contactoRepository.save(new Contacto(
                clean(request.nombreDestinatario()),
                clean(request.documentoDestinatario()),
                clean(request.telefonoDestinatario())
        ));
        Direccion origen = direccionRepository.save(new Direccion(
                clean(request.direccionOrigen()),
                clean(request.ciudadOrigen())
        ));
        Direccion destino = direccionRepository.save(new Direccion(
                clean(request.direccionDestino()),
                clean(request.ciudadDestino())
        ));

        Envio envio = envioRepository.save(new Envio(
                numeroGuiaService.generar(),
                remitente,
                destinatario,
                origen,
                destino,
                pesoKg,
                tipoServicio,
                fechaEstimada
        ));

        eventoRepository.save(new EventoLogistico(
                envio,
                TipoEventoLogistico.CREADO,
                EstadoEnvio.PENDIENTE_RECOLECCION,
                origen.getCiudad(),
                "Envio registrado"
        ));

        return new RegistrarEnvioResponse(envio.getNumeroGuia());
    }

    @Transactional
    public List<EnvioRecordResponse> listar() {
        return envioRepository.findAll()
                .stream()
                .map(envio -> envioMapper.toRecord(envio, eventoRepository.findByEnvioOrderByFechaHoraDesc(envio)))
                .toList();
    }

    @Transactional
    public DatosGuiaResponse consultar(String numeroGuia) {
        Envio envio = buscarPorGuia(numeroGuia);
        return envioMapper.toDatosGuia(envio, eventoRepository.findByEnvioOrderByFechaHoraAsc(envio));
    }

    @Transactional
    public EnvioRecordResponse actualizarEstado(String numeroGuia, ActualizarEstadoRequest request) {
        Envio envio = buscarPorGuia(numeroGuia);
        EstadoEnvio nuevoEstado = EstadoEnvio.fromApiValue(request.nuevoEstado());

        transitionPolicy.validar(envio.getEstadoActual(), nuevoEstado);
        envio.actualizarEstado(nuevoEstado);

        eventoRepository.save(new EventoLogistico(
                envio,
                TipoEventoLogistico.fromEstado(nuevoEstado),
                nuevoEstado,
                envio.getDireccionDestino().getCiudad(),
                "Estado actualizado"
        ));

        Envio updated = envioRepository.save(envio);
        return envioMapper.toRecord(updated, eventoRepository.findByEnvioOrderByFechaHoraDesc(updated));
    }

    @Transactional
    public Envio buscarPorGuia(String numeroGuia) {
        return envioRepository.findByNumeroGuiaIgnoreCase(clean(numeroGuia))
                .orElseThrow(() -> new EnvioNoEncontradoException(numeroGuia));
    }

    private BigDecimal parsePeso(String value) {
        try {
            BigDecimal peso = new BigDecimal(clean(value));
            if (peso.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ReglaNegocioException("El peso debe ser mayor que cero.");
            }
            return peso;
        } catch (NumberFormatException exception) {
            throw new ReglaNegocioException("El peso debe ser numerico.");
        }
    }

    private TipoServicio parseTipoServicio(String value) {
        try {
            return TipoServicio.valueOf(clean(value).toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ReglaNegocioException("Tipo de servicio no valido.");
        }
    }

    private LocalDate parseFecha(String value) {
        LocalDate fecha;
        try {
            fecha = LocalDate.parse(clean(value));
        } catch (DateTimeParseException exception) {
            throw new ReglaNegocioException("Fecha estimada de entrega no valida.");
        }
        if (fecha.isBefore(LocalDate.now())) {
            throw new ReglaNegocioException("La fecha estimada de entrega no puede estar en el pasado.");
        }
        return fecha;
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
