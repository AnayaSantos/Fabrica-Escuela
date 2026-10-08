package com.hu.envios.repository;

import com.hu.envios.entity.AsignacionTransporte;
import com.hu.envios.entity.Envio;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsignacionTransporteRepository extends JpaRepository<AsignacionTransporte, Long> {

    Optional<AsignacionTransporte> findByEnvio(Envio envio);
}
