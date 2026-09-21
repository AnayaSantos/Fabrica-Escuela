package com.hu.envios.service;

import com.hu.envios.repository.EnvioRepository;
import java.time.Year;
import org.springframework.stereotype.Service;

@Service
public class NumeroGuiaService {

    private final EnvioRepository envioRepository;

    public NumeroGuiaService(EnvioRepository envioRepository) {
        this.envioRepository = envioRepository;
    }

    public String generar() {
        int year = Year.now().getValue();
        long counter = envioRepository.count() + 1;
        String numeroGuia = format(year, counter);

        while (envioRepository.existsByNumeroGuia(numeroGuia)) {
            counter++;
            numeroGuia = format(year, counter);
        }

        return numeroGuia;
    }

    private String format(int year, long counter) {
        return "LG-" + year + "-" + String.format("%08d", counter);
    }
}
