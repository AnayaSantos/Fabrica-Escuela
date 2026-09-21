package com.hu.envios.repository;

import com.hu.envios.entity.Envio;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvioRepository extends JpaRepository<Envio, Long> {

    Optional<Envio> findByNumeroGuiaIgnoreCase(String numeroGuia);

    boolean existsByNumeroGuia(String numeroGuia);
}
