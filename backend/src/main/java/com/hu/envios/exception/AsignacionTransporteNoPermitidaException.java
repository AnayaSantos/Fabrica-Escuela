package com.hu.envios.exception;

public class AsignacionTransporteNoPermitidaException extends RuntimeException {

    public AsignacionTransporteNoPermitidaException() {
        super("El estado actual del envio no permite nuevas asignaciones.");
    }
}
