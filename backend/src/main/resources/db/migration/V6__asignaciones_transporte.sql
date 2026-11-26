CREATE TABLE asignaciones_transporte (
    id BIGSERIAL PRIMARY KEY,
    envio_id BIGINT NOT NULL,
    ruta_id BIGINT NOT NULL,
    vehiculo_id BIGINT NOT NULL,
    fecha_asignacion TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_asignaciones_transporte_envio UNIQUE (envio_id),
    CONSTRAINT fk_asignaciones_transporte_envio FOREIGN KEY (envio_id) REFERENCES envios (id),
    CONSTRAINT fk_asignaciones_transporte_ruta FOREIGN KEY (ruta_id) REFERENCES rutas (id),
    CONSTRAINT fk_asignaciones_transporte_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos (id)
);
