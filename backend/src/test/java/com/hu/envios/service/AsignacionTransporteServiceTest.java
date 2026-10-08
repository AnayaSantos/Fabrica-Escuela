package com.hu.envios.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.hu.envios.dto.AsignacionTransporteResponse;
import com.hu.envios.dto.AsignarTransporteRequest;
import com.hu.envios.entity.AsignacionTransporte;
import com.hu.envios.entity.CentroDistribucion;
import com.hu.envios.entity.Contacto;
import com.hu.envios.entity.Direccion;
import com.hu.envios.entity.Envio;
import com.hu.envios.entity.EstadoEnvio;
import com.hu.envios.entity.Ruta;
import com.hu.envios.entity.TipoServicio;
import com.hu.envios.entity.Vehiculo;
import com.hu.envios.exception.AsignacionTransporteNoPermitidaException;
import com.hu.envios.repository.AsignacionTransporteRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AsignacionTransporteServiceTest {

    private EnvioService envioService;
    private RutaService rutaService;
    private VehiculoService vehiculoService;
    private AsignacionTransporteRepository asignacionTransporteRepository;
    private AsignacionTransporteService asignacionTransporteService;

    private Envio envioPendiente;
    private Ruta ruta;
    private Vehiculo vehiculo;

    @BeforeEach
    void setUp() {
        envioService = mock(EnvioService.class);
        rutaService = mock(RutaService.class);
        vehiculoService = mock(VehiculoService.class);
        asignacionTransporteRepository = mock(AsignacionTransporteRepository.class);

        asignacionTransporteService = new AsignacionTransporteService(
                envioService,
                rutaService,
                vehiculoService,
                asignacionTransporteRepository,
                new AsignacionTransportePolicy(),
                new FechaFormatter()
        );

        Contacto contacto = new Contacto("Juan", "123", "300");
        Direccion direccion = new Direccion("Calle 1", "Bogota");
        envioPendiente = new Envio("LG-2026-00000001", contacto, contacto, direccion, direccion, BigDecimal.ONE, TipoServicio.ESTANDAR, LocalDate.now().plusDays(5));

        CentroDistribucion origen = new CentroDistribucion("Centro A", "Bogota", "Calle 1");
        CentroDistribucion destino = new CentroDistribucion("Centro B", "Medellin", "Calle 2");
        ruta = new Ruta("Bogota - Medellin", origen, destino);
        vehiculo = new Vehiculo("ABC-123", "Pedro", "Furgon");

        when(rutaService.buscarPorId(1L)).thenReturn(ruta);
        when(vehiculoService.buscarPorId(1L)).thenReturn(vehiculo);
        when(asignacionTransporteRepository.save(any(AsignacionTransporte.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void asignaTransporteExitosamenteCuandoEnvioEstaPendienteDeRecoleccion() {
        when(envioService.buscarPorGuia("LG-2026-00000001")).thenReturn(envioPendiente);
        when(asignacionTransporteRepository.findByEnvio(envioPendiente)).thenReturn(Optional.empty());

        AsignacionTransporteResponse response = asignacionTransporteService.asignar(
                "LG-2026-00000001", new AsignarTransporteRequest(1L, 1L)
        );

        assertThat(response.numeroGuia()).isEqualTo("LG-2026-00000001");
        assertThat(response.vehiculoPlaca()).isEqualTo("ABC-123");
    }

    @Test
    void bloqueaAsignacionCuandoEnvioYaFueEntregado() {
        envioPendiente.actualizarEstado(EstadoEnvio.EN_TRANSITO);
        envioPendiente.actualizarEstado(EstadoEnvio.EN_REPARTO);
        envioPendiente.actualizarEstado(EstadoEnvio.ENTREGADO);
        when(envioService.buscarPorGuia("LG-2026-00000001")).thenReturn(envioPendiente);

        AsignarTransporteRequest request = new AsignarTransporteRequest(1L, 1L);

        assertThatThrownBy(() -> asignacionTransporteService.asignar("LG-2026-00000001", request))
                .isInstanceOf(AsignacionTransporteNoPermitidaException.class);
    }
}
