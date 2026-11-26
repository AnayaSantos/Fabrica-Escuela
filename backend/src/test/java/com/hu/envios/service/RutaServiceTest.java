package com.hu.envios.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.hu.envios.dto.RegistrarRutaRequest;
import com.hu.envios.dto.RutaResponse;
import com.hu.envios.entity.CentroDistribucion;
import com.hu.envios.entity.Ruta;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.CentroDistribucionRepository;
import com.hu.envios.repository.ParadaRutaRepository;
import com.hu.envios.repository.RutaRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RutaServiceTest {

    private RutaRepository rutaRepository;
    private CentroDistribucionService centroDistribucionService;
    private RutaService rutaService;

    private CentroDistribucion medellin;
    private CentroDistribucion bogota;
    private CentroDistribucion tunja;

    @BeforeEach
    void setUp() {
        rutaRepository = mock(RutaRepository.class);
        CentroDistribucionRepository centroDistribucionRepository = mock(CentroDistribucionRepository.class);
        ParadaRutaRepository paradaRutaRepository = mock(ParadaRutaRepository.class);
        centroDistribucionService = new CentroDistribucionService(centroDistribucionRepository, rutaRepository, paradaRutaRepository);
        rutaService = new RutaService(rutaRepository, centroDistribucionService);

        medellin = new CentroDistribucion("Centro Medellin", "Medellin", "Calle 1");
        bogota = new CentroDistribucion("Centro Bogota", "Bogota", "Calle 2");
        tunja = new CentroDistribucion("Centro Tunja", "Tunja", "Calle 3");
        setId(medellin, 1L);
        setId(bogota, 2L);
        setId(tunja, 3L);

        when(centroDistribucionRepository.findById(1L)).thenReturn(java.util.Optional.of(medellin));
        when(centroDistribucionRepository.findById(2L)).thenReturn(java.util.Optional.of(bogota));
        when(centroDistribucionRepository.findById(3L)).thenReturn(java.util.Optional.of(tunja));
        when(rutaRepository.save(any(Ruta.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void registraRutaExitosamenteConOrigenYDestinoDistintos() {
        RutaResponse response = rutaService.registrar(new RegistrarRutaRequest("Medellin - Bogota", 1L, 2L, null));

        assertThat(response.centroOrigenId()).isEqualTo(1L);
        assertThat(response.centroDestinoId()).isEqualTo(2L);
        assertThat(response.paradas()).isEmpty();
    }

    @Test
    void rechazaOrigenIgualADestino() {
        RegistrarRutaRequest request = new RegistrarRutaRequest("Ruta invalida", 1L, 1L, null);

        assertThatThrownBy(() -> rutaService.registrar(request))
                .isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void guardaLasParadasRespetandoElOrdenRecibido() {
        RutaResponse response = rutaService.registrar(
                new RegistrarRutaRequest("Medellin - Bogota con paradas", 1L, 2L, List.of(3L))
        );

        assertThat(response.paradas()).hasSize(1);
        assertThat(response.paradas().get(0).centroDistribucionId()).isEqualTo(3L);
        assertThat(response.paradas().get(0).orden()).isEqualTo(1);
    }

    private void setId(CentroDistribucion centro, Long id) {
        try {
            var field = CentroDistribucion.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(centro, id);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
