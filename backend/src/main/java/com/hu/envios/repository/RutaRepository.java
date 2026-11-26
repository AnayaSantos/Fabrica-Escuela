package com.hu.envios.repository;

import com.hu.envios.entity.Ruta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RutaRepository extends JpaRepository<Ruta, Long> {

    boolean existsByCentroOrigenIdOrCentroDestinoId(Long centroOrigenId, Long centroDestinoId);
}
