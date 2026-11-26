-- HU-16: registro de incidencias sobre un envio. Cada incidencia queda enlazada al
-- evento_logistico (tipo CON_INCIDENCIA) que genera en el historial del envio, para no
-- duplicar la fecha/ubicacion/detalle ya modelados en eventos_logisticos.
-- La evidencia (foto) se guarda como BYTEA directamente en Postgres: el plan free de
-- Postgres ya se paso a uno persistente, y el backend corre en un plan free de Render con
-- filesystem efimero, asi que no hay donde guardar un archivo en disco de forma confiable.

CREATE TABLE incidencias (
    id BIGSERIAL PRIMARY KEY,
    envio_id BIGINT NOT NULL,
    evento_id BIGINT NOT NULL,
    tipo_incidencia VARCHAR(40) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    evidencia BYTEA,
    evidencia_nombre VARCHAR(255),
    evidencia_content_type VARCHAR(100),
    fecha_hora TIMESTAMP NOT NULL,
    registrado_por VARCHAR(120),
    CONSTRAINT fk_incidencias_envio FOREIGN KEY (envio_id) REFERENCES envios (id),
    CONSTRAINT fk_incidencias_evento FOREIGN KEY (evento_id) REFERENCES eventos_logisticos (id),
    CONSTRAINT chk_incidencias_tipo CHECK (tipo_incidencia IN ('PAQUETE_DANADO', 'DIRECCION_INCORRECTA', 'AUSENCIA_DOMICILIO', 'OTRO'))
);

CREATE INDEX idx_incidencias_envio ON incidencias (envio_id);
