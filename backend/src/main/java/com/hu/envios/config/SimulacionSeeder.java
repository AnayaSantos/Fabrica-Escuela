package com.hu.envios.config;

import com.hu.envios.entity.CentroDistribucion;
import com.hu.envios.entity.Ruta;
import com.hu.envios.entity.Vehiculo;
import com.hu.envios.repository.CentroDistribucionRepository;
import com.hu.envios.repository.RutaRepository;
import com.hu.envios.repository.VehiculoRepository;
import jakarta.transaction.Transactional;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Carga los datos de simulacion documentados en "docs/Asignacion de rutas por camion.md":
 * 5 camiones con placas fijas y las rutas ciudad-a-ciudad que cada uno cubre. Como HU-014 exige
 * que las rutas se definan entre Centros de Distribucion (no entre ciudades sueltas), este seeder
 * crea un CentroDistribucion por cada ciudad mencionada en el documento. Son datos de simulacion,
 * ajustables despues segun confirmo el usuario; no representan direcciones reales.
 */
@Component
public class SimulacionSeeder implements ApplicationRunner {

    private record TramoSeed(String origen, String destino) {
    }

    private record CamionSeed(String placa, String conductor, String tipo, List<TramoSeed> tramos) {
    }

    private static final List<CamionSeed> CAMIONES = List.of(
            new CamionSeed("ABC-123", "Conductor ABC-123", "Furgon", List.of(
                    new TramoSeed("Medellín", "Bogotá"),
                    new TramoSeed("Bogotá", "Tunja"),
                    new TramoSeed("Bogotá", "Villavicencio")
            )),
            new CamionSeed("DEF-456", "Conductor DEF-456", "Furgon", List.of(
                    new TramoSeed("Medellín", "Cali"),
                    new TramoSeed("Cali", "Pereira"),
                    new TramoSeed("Pereira", "Manizales"),
                    new TramoSeed("Manizales", "Medellín")
            )),
            new CamionSeed("GHI-789", "Conductor GHI-789", "Furgon", List.of(
                    new TramoSeed("Medellín", "Puerto Berrío"),
                    new TramoSeed("Puerto Berrío", "Bucaramanga"),
                    new TramoSeed("Bucaramanga", "Cúcuta"),
                    new TramoSeed("Bucaramanga", "Bogotá")
            )),
            new CamionSeed("JKL-321", "Conductor JKL-321", "Furgon", List.of(
                    new TramoSeed("Medellín", "Montería"),
                    new TramoSeed("Montería", "Barranquilla"),
                    new TramoSeed("Barranquilla", "Cartagena"),
                    new TramoSeed("Barranquilla", "Santa Marta")
            )),
            new CamionSeed("MNO-654", "Conductor MNO-654", "Furgon", List.of(
                    new TramoSeed("Cali", "Popayán"),
                    new TramoSeed("Cali", "Bogotá"),
                    new TramoSeed("Bogotá", "Medellín")
            ))
    );

    private static final String DIRECCION_SIMULADA = "Sede principal (simulado)";

    private final CentroDistribucionRepository centroDistribucionRepository;
    private final RutaRepository rutaRepository;
    private final VehiculoRepository vehiculoRepository;

    public SimulacionSeeder(
            CentroDistribucionRepository centroDistribucionRepository,
            RutaRepository rutaRepository,
            VehiculoRepository vehiculoRepository
    ) {
        this.centroDistribucionRepository = centroDistribucionRepository;
        this.rutaRepository = rutaRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (vehiculoRepository.count() > 0) {
            return;
        }

        Map<String, CentroDistribucion> centrosPorCiudad = new LinkedHashMap<>();
        for (CamionSeed camion : CAMIONES) {
            for (TramoSeed tramo : camion.tramos()) {
                centrosPorCiudad.computeIfAbsent(tramo.origen(), this::obtenerOCrearCentro);
                centrosPorCiudad.computeIfAbsent(tramo.destino(), this::obtenerOCrearCentro);
            }
        }

        for (CamionSeed camion : CAMIONES) {
            Vehiculo vehiculo = new Vehiculo(camion.placa(), camion.conductor(), camion.tipo());
            for (TramoSeed tramo : camion.tramos()) {
                CentroDistribucion origen = centrosPorCiudad.get(tramo.origen());
                CentroDistribucion destino = centrosPorCiudad.get(tramo.destino());
                Ruta ruta = rutaRepository.save(new Ruta(tramo.origen() + " - " + tramo.destino(), origen, destino));
                vehiculo.habilitarRuta(ruta);
            }
            vehiculoRepository.save(vehiculo);
        }
    }

    private CentroDistribucion obtenerOCrearCentro(String ciudad) {
        String nombre = "Centro de Distribución " + ciudad;
        return centroDistribucionRepository
                .findByNombreIgnoreCaseAndCiudadIgnoreCaseAndDireccionIgnoreCase(nombre, ciudad, DIRECCION_SIMULADA)
                .orElseGet(() -> centroDistribucionRepository.save(new CentroDistribucion(nombre, ciudad, DIRECCION_SIMULADA)));
    }
}
