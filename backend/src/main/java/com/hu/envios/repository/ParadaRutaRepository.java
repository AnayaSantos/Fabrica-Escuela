package com.hu.envios.repository;

import com.hu.envios.entity.ParadaRuta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParadaRutaRepository extends JpaRepository<ParadaRuta, Long> {

    boolean existsByCentroDistribucionId(Long centroDistribucionId);
}
