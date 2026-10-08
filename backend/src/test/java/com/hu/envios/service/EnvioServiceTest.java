package com.hu.envios.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.hu.envios.dto.RegistrarEnvioRequest;
import com.hu.envios.dto.RegistrarEnvioResponse;
import com.hu.envios.entity.Contacto;
import com.hu.envios.entity.Direccion;
import com.hu.envios.entity.Envio;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.ContactoRepository;
import com.hu.envios.repository.DireccionRepository;
import com.hu.envios.repository.EnvioRepository;
import com.hu.envios.repository.EventoLogisticoRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class EnvioServiceTest {

    private EnvioService envioService;

    @BeforeEach
    void setUp() {
        ContactoRepository contactoRepository = mock(ContactoRepository.class);
        DireccionRepository direccionRepository = mock(DireccionRepository.class);
        EnvioRepository envioRepository = mock(EnvioRepository.class);
        EventoLogisticoRepository eventoRepository = mock(EventoLogisticoRepository.class);
        NumeroGuiaService numeroGuiaService = mock(NumeroGuiaService.class);
        EstadoTransitionPolicy transitionPolicy = mock(EstadoTransitionPolicy.class);
        EnvioMapper envioMapper = mock(EnvioMapper.class);

        when(contactoRepository.save(any(Contacto.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(direccionRepository.save(any(Direccion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(envioRepository.save(any(Envio.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(numeroGuiaService.generar()).thenReturn("LG-2026-00000001");

        envioService = new EnvioService(
                contactoRepository,
                direccionRepository,
                envioRepository,
                eventoRepository,
                numeroGuiaService,
                transitionPolicy,
                envioMapper
        );
    }

    @Test
    void rechazaFechaEstimadaEnElPasado() {
        RegistrarEnvioRequest request = solicitudCon(LocalDate.now().minusDays(1).toString());

        assertThatThrownBy(() -> envioService.registrar(request))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessage("La fecha estimada de entrega no puede estar en el pasado.");
    }

    @Test
    void aceptaFechaEstimadaDeHoy() {
        RegistrarEnvioRequest request = solicitudCon(LocalDate.now().toString());

        RegistrarEnvioResponse response = envioService.registrar(request);

        assertThat(response.numeroGuia()).isEqualTo("LG-2026-00000001");
    }

    @Test
    void aceptaFechaEstimadaFutura() {
        RegistrarEnvioRequest request = solicitudCon(LocalDate.now().plusDays(10).toString());

        RegistrarEnvioResponse response = envioService.registrar(request);

        assertThat(response.numeroGuia()).isEqualTo("LG-2026-00000001");
    }

    private RegistrarEnvioRequest solicitudCon(String fechaEstimadaEntrega) {
        return new RegistrarEnvioRequest(
                "Laura Gomez",
                "1020456789",
                "3005550190",
                "Calle 72 #10-34",
                "Bogota",
                "Carlos Perez",
                "80123456",
                "3105550144",
                "Carrera 43A #7-50",
                "Medellin",
                "2.5",
                "EXPRESS",
                fechaEstimadaEntrega
        );
    }
}
