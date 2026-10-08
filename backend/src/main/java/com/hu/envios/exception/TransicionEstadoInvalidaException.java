package com.hu.envios.exception;

public class TransicionEstadoInvalidaException extends RuntimeException {

    public TransicionEstadoInvalidaException() {
        super("La transicion de estado solicitada no es valida.");
    }
}
