package com.hu.envios.repository;

import com.hu.envios.entity.Envio;
import com.hu.envios.entity.EventoLogistico;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoLogisticoRepository extends JpaRepository<EventoLogistico, Long> {

    List<EventoLogistico> findByEnvioOrderByFechaHoraDesc(Envio envio);

    List<EventoLogistico> findByEnvioOrderByFechaHoraAsc(Envio envio);
}
