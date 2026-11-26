package com.hu.envios.repository;

import com.hu.envios.entity.CentroDistribucion;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CentroDistribucionRepository extends JpaRepository<CentroDistribucion, Long> {

    boolean existsByNombreIgnoreCaseAndCiudadIgnoreCaseAndDireccionIgnoreCase(String nombre, String ciudad, String direccion);

    boolean existsByNombreIgnoreCaseAndCiudadIgnoreCaseAndDireccionIgnoreCaseAndIdNot(
            String nombre, String ciudad, String direccion, Long id
    );

    Optional<CentroDistribucion> findByNombreIgnoreCaseAndCiudadIgnoreCaseAndDireccionIgnoreCase(
            String nombre, String ciudad, String direccion
    );
}
