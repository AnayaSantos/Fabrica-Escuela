package com.hu.envios.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.hu.envios.dto.CentroDistribucionResponse;
import com.hu.envios.dto.RegistrarCentroDistribucionRequest;
import com.hu.envios.entity.CentroDistribucion;
import com.hu.envios.exception.RecursoDuplicadoException;
import com.hu.envios.exception.ReglaNegocioException;
import com.hu.envios.repository.CentroDistribucionRepository;
import com.hu.envios.repository.ParadaRutaRepository;
import com.hu.envios.repository.RutaRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CentroDistribucionServiceTest {

    private CentroDistribucionRepository repository;
    private RutaRepository rutaRepository;
    private ParadaRutaRepository paradaRutaRepository;
    private CentroDistribucionService service;

    @BeforeEach
    void setUp() {
        repository = mock(CentroDistribucionRepository.class);
        rutaRepository = mock(RutaRepository.class);
        paradaRutaRepository = mock(ParadaRutaRepository.class);
        when(repository.save(any(CentroDistribucion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        service = new CentroDistribucionService(repository, rutaRepository, paradaRutaRepository);
    }

    @Test
    void registraCentroDistribucionExitosamente() {
        when(repository.existsByNombreIgnoreCaseAndCiudadIgnoreCaseAndDireccionIgnoreCase("Bodega Norte", "Bogota", "Calle 10"))
                .thenReturn(false);

        CentroDistribucionResponse response = service.registrar(
                new RegistrarCentroDistribucionRequest("Bodega Norte", "Bogota", "Calle 10")
        );

        assertThat(response.nombre()).isEqualTo("Bodega Norte");
        assertThat(response.ciudad()).isEqualTo("Bogota");
    }

    @Test
    void rechazaCentroDuplicadoEnLaMismaCiudad() {
        when(repository.existsByNombreIgnoreCaseAndCiudadIgnoreCaseAndDireccionIgnoreCase("Bodega Norte", "Bogota", "Calle 10"))
                .thenReturn(true);

        RegistrarCentroDistribucionRequest request = new RegistrarCentroDistribucionRequest("Bodega Norte", "Bogota", "Calle 10");

        assertThatThrownBy(() -> service.registrar(request))
                .isInstanceOf(RecursoDuplicadoException.class);
    }

    @Test
    void rechazaEliminarCentroReferenciadoComoOrigenODestinoDeUnaRuta() {
        CentroDistribucion centro = new CentroDistribucion("Bodega Norte", "Bogota", "Calle 10");
        when(repository.findById(5L)).thenReturn(Optional.of(centro));
        when(rutaRepository.existsByCentroOrigenIdOrCentroDestinoId(5L, 5L)).thenReturn(true);

        assertThatThrownBy(() -> service.eliminar(5L))
                .isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void rechazaEliminarCentroReferenciadoComoParadaDeUnaRuta() {
        CentroDistribucion centro = new CentroDistribucion("Bodega Norte", "Bogota", "Calle 10");
        when(repository.findById(5L)).thenReturn(Optional.of(centro));
        when(rutaRepository.existsByCentroOrigenIdOrCentroDestinoId(5L, 5L)).thenReturn(false);
        when(paradaRutaRepository.existsByCentroDistribucionId(5L)).thenReturn(true);

        assertThatThrownBy(() -> service.eliminar(5L))
                .isInstanceOf(ReglaNegocioException.class);
    }
}
