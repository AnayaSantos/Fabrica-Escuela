package com.hu.envios.exception;

public class EnvioNoEncontradoException extends RuntimeException {

    public EnvioNoEncontradoException(String numeroGuia) {
        super("No existe un envio con la guia " + numeroGuia + ".");
    }
}
