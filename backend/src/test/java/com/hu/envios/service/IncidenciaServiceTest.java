package com.hu.envios.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.hu.envios.dto.IncidenciaRegistradaResponse;
import com.hu.envios.entity.Contacto;
import com.hu.envios.entity.Direccion;
import com.hu.envios.entity.EstadoEnvio;
import com.hu.envios.entity.Envio;
import com.hu.envios.entity.EventoLogistico;
import com.hu.envios.entity.Incidencia;
import com.hu.envios.entity.TipoServicio;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.EventoLogisticoRepository;
import com.hu.envios.repository.IncidenciaRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

class IncidenciaServiceTest {

    private EnvioService envioService;
    private EventoLogisticoRepository eventoRepository;
    private IncidenciaRepository incidenciaRepository;
    private IncidenciaService incidenciaService;
    private Envio envio;

    @BeforeEach
    void setUp() {
        envioService = mock(EnvioService.class);
        eventoRepository = mock(EventoLogisticoRepository.class);
        incidenciaRepository = mock(IncidenciaRepository.class);

        incidenciaService = new IncidenciaService(envioService, eventoRepository, incidenciaRepository, new FechaFormatter());

        Contacto contacto = new Contacto("Juan", "123", "300");
        Direccion direccion = new Direccion("Calle 1", "Bogota");
        envio = new Envio("LG-2026-00000001", contacto, contacto, direccion, direccion, BigDecimal.ONE, TipoServicio.ESTANDAR, LocalDate.now().plusDays(5));

        when(envioService.buscarPorGuia("LG-2026-00000001")).thenReturn(envio);
        when(eventoRepository.save(any(EventoLogistico.class))).thenAnswer(invocation -> {
            EventoLogistico evento = invocation.getArgument(0);
            ReflectionTestUtils.setField(evento, "id", 1L);
            ReflectionTestUtils.setField(evento, "fechaHora", LocalDateTime.now());
            return evento;
        });
        when(incidenciaRepository.save(any(Incidencia.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void registraIncidenciaSinEvidenciaYActualizaEstadoDelEnvio() {
        IncidenciaRegistradaResponse response = incidenciaService.registrar(
                "LG-2026-00000001", "Paquete dañado", "Llego con la caja rota", null, "operador@envios.local"
        );

        assertThat(envio.getEstadoActual()).isEqualTo(EstadoEnvio.CON_INCIDENCIA);
        assertThat(response.estado()).isEqualTo("CON INCIDENCIA");
        assertThat(response.detalle()).isEqualTo("Llego con la caja rota");
        assertThat(response.tipoIncidencia()).isEqualTo("Paquete dañado");
        assertThat(response.registradoPor()).isEqualTo("operador@envios.local");
    }

    @Test
    void registraIncidenciaConEvidenciaValida() {
        MultipartFile evidencia = new MockMultipartFile("evidencia", "foto.jpg", "image/jpeg", new byte[]{1, 2, 3});

        IncidenciaRegistradaResponse response = incidenciaService.registrar(
                "LG-2026-00000001", "Otro", "Novedad con foto", evidencia, "operador@envios.local"
        );

        assertThat(response.id()).isEqualTo("1");
    }

    @Test
    void rechazaTipoDeIncidenciaInvalido() {
        assertThatThrownBy(() -> incidenciaService.registrar(
                "LG-2026-00000001", "Tipo inexistente", "Detalle", null, "operador@envios.local"
        )).isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void rechazaDescripcionVacia() {
        assertThatThrownBy(() -> incidenciaService.registrar(
                "LG-2026-00000001", "Otro", "   ", null, "operador@envios.local"
        )).isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void rechazaEvidenciaQueNoEsImagen() {
        MultipartFile evidencia = new MockMultipartFile("evidencia", "archivo.pdf", "application/pdf", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> incidenciaService.registrar(
                "LG-2026-00000001", "Otro", "Detalle", evidencia, "operador@envios.local"
        )).isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void rechazaEvidenciaDemasiadoGrande() {
        MultipartFile evidencia = mock(MultipartFile.class);
        when(evidencia.isEmpty()).thenReturn(false);
        when(evidencia.getSize()).thenReturn(6L * 1024 * 1024);

        assertThatThrownBy(() -> incidenciaService.registrar(
                "LG-2026-00000001", "Otro", "Detalle", evidencia, "operador@envios.local"
        )).isInstanceOf(ReglaNegocioException.class);
    }
}
