package com.hu.envios.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.hu.envios.dto.RegistrarVehiculoRequest;
import com.hu.envios.dto.VehiculoResponse;
import com.hu.envios.entity.Vehiculo;
import com.hu.envios.exception.RecursoDuplicadoException;
import com.hu.envios.repository.VehiculoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class VehiculoServiceTest {

    private VehiculoRepository vehiculoRepository;
    private VehiculoService vehiculoService;

    @BeforeEach
    void setUp() {
        vehiculoRepository = mock(VehiculoRepository.class);
        when(vehiculoRepository.save(any(Vehiculo.class))).thenAnswer(invocation -> invocation.getArgument(0));
        vehiculoService = new VehiculoService(vehiculoRepository);
    }

    @Test
    void registraVehiculoExitosamente() {
        when(vehiculoRepository.existsByPlacaIgnoreCase("ABC-123")).thenReturn(false);

        VehiculoResponse response = vehiculoService.registrar(new RegistrarVehiculoRequest("abc-123", "Juan Perez", "Furgon"));

        assertThat(response.placa()).isEqualTo("ABC-123");
        assertThat(response.conductor()).isEqualTo("Juan Perez");
    }

    @Test
    void rechazaPlacaDuplicada() {
        when(vehiculoRepository.existsByPlacaIgnoreCase("ABC-123")).thenReturn(true);

        RegistrarVehiculoRequest request = new RegistrarVehiculoRequest("ABC-123", "Juan Perez", "Furgon");

        assertThatThrownBy(() -> vehiculoService.registrar(request))
                .isInstanceOf(RecursoDuplicadoException.class);
    }
}
