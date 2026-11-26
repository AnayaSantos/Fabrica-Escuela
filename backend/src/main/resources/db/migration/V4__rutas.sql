CREATE TABLE rutas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    centro_origen_id BIGINT NOT NULL,
    centro_destino_id BIGINT NOT NULL,
    activa BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_rutas_centro_origen FOREIGN KEY (centro_origen_id) REFERENCES centros_distribucion (id),
    CONSTRAINT fk_rutas_centro_destino FOREIGN KEY (centro_destino_id) REFERENCES centros_distribucion (id),
    CONSTRAINT chk_rutas_origen_destino_distintos CHECK (centro_origen_id <> centro_destino_id)
);

CREATE TABLE paradas_ruta (
    id BIGSERIAL PRIMARY KEY,
    ruta_id BIGINT NOT NULL,
    centro_distribucion_id BIGINT NOT NULL,
    orden INT NOT NULL,
    CONSTRAINT fk_paradas_ruta_ruta FOREIGN KEY (ruta_id) REFERENCES rutas (id) ON DELETE CASCADE,
    CONSTRAINT fk_paradas_ruta_centro FOREIGN KEY (centro_distribucion_id) REFERENCES centros_distribucion (id),
    CONSTRAINT uk_paradas_ruta_orden UNIQUE (ruta_id, orden)
);
