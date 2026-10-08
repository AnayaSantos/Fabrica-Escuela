package com.hu.envios.exception;

public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String recurso, String identificador) {
        super(recurso + " no encontrado: " + identificador);
    }
}
