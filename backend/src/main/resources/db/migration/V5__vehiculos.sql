CREATE TABLE vehiculos (
    id BIGSERIAL PRIMARY KEY,
    placa VARCHAR(20) NOT NULL,
    conductor VARCHAR(120) NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_vehiculos_placa UNIQUE (placa)
);

CREATE TABLE vehiculo_rutas (
    vehiculo_id BIGINT NOT NULL,
    ruta_id BIGINT NOT NULL,
    PRIMARY KEY (vehiculo_id, ruta_id),
    CONSTRAINT fk_vehiculo_rutas_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos (id),
    CONSTRAINT fk_vehiculo_rutas_ruta FOREIGN KEY (ruta_id) REFERENCES rutas (id)
);
