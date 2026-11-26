-- Baseline del esquema ya desplegado por Hibernate (ddl-auto=update) para las HU-01..HU-04.
-- Verificado contra el esquema real (pg_dump --schema-only) del contenedor hu-envios-db antes de
-- escribir este script, no solo contra docs/02-modelo-datos-postgresql.md. Diferencias encontradas
-- frente a la documentacion y reflejadas aqui a propósito:
--   * El FK de eventos_logisticos.envio_id NO tiene ON DELETE CASCADE en la base real (la entidad
--     EventoLogistico no declara @OnDelete), aunque los docs lo sugerian.
--   * Hibernate 6 genera automaticamente un CHECK por cada columna @Enumerated(STRING); por eso aqui
--     se agregan los CHECK de estado_actual/tipo_servicio/estado_resultante/tipo_evento, que los docs
--     no mencionaban explicitamente para estado_actual.
--   * No existe ningun CHECK de peso_kg > 0 a nivel de base de datos (esa regla solo vive hoy en
--     EnvioService); no se agrega aqui para no introducir una restriccion que no estaba realmente
--     vigente en produccion.
-- El indice de eventos_logisticos SI se agrega aunque Hibernate nunca lo creo, porque es una mejora de
-- lectura pura (no afecta el mapeo JPA ni la validacion de esquema de Hibernate) y coincide con el
-- diseño documentado.

CREATE TABLE contactos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    documento VARCHAR(40) NOT NULL,
    telefono VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE direcciones (
    id BIGSERIAL PRIMARY KEY,
    direccion VARCHAR(180) NOT NULL,
    ciudad VARCHAR(80) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE envios (
    id BIGSERIAL PRIMARY KEY,
    numero_guia VARCHAR(30) NOT NULL,
    remitente_id BIGINT NOT NULL,
    destinatario_id BIGINT NOT NULL,
    direccion_origen_id BIGINT NOT NULL,
    direccion_destino_id BIGINT NOT NULL,
    peso_kg NUMERIC(10,2) NOT NULL,
    tipo_servicio VARCHAR(20) NOT NULL,
    estado_actual VARCHAR(40) NOT NULL,
    fecha_estimada_entrega DATE NOT NULL,
    fecha_registro TIMESTAMP NOT NULL,
    fecha_ultima_actualizacion TIMESTAMP NOT NULL,
    CONSTRAINT uk_envios_numero_guia UNIQUE (numero_guia),
    CONSTRAINT fk_envios_remitente FOREIGN KEY (remitente_id) REFERENCES contactos (id),
    CONSTRAINT fk_envios_destinatario FOREIGN KEY (destinatario_id) REFERENCES contactos (id),
    CONSTRAINT fk_envios_direccion_origen FOREIGN KEY (direccion_origen_id) REFERENCES direcciones (id),
    CONSTRAINT fk_envios_direccion_destino FOREIGN KEY (direccion_destino_id) REFERENCES direcciones (id),
    CONSTRAINT chk_envios_tipo_servicio CHECK (tipo_servicio IN ('ESTANDAR', 'EXPRESS')),
    CONSTRAINT chk_envios_estado_actual CHECK (estado_actual IN ('PENDIENTE_RECOLECCION', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO', 'CON_INCIDENCIA', 'DEVUELTO'))
);

CREATE TABLE eventos_logisticos (
    id BIGSERIAL PRIMARY KEY,
    envio_id BIGINT NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    tipo_evento VARCHAR(40) NOT NULL,
    estado_resultante VARCHAR(40),
    ubicacion VARCHAR(120) NOT NULL,
    detalle VARCHAR(250),
    CONSTRAINT fk_eventos_logisticos_envio FOREIGN KEY (envio_id) REFERENCES envios (id),
    CONSTRAINT chk_eventos_logisticos_tipo_evento CHECK (tipo_evento IN ('CREADO', 'PREPARANDO', 'EN_BODEGA', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO', 'CON_INCIDENCIA', 'DEVUELTO')),
    CONSTRAINT chk_eventos_logisticos_estado_resultante CHECK (estado_resultante IS NULL OR estado_resultante IN ('PENDIENTE_RECOLECCION', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO', 'CON_INCIDENCIA', 'DEVUELTO'))
);

CREATE INDEX idx_eventos_logisticos_envio_fecha ON eventos_logisticos (envio_id, fecha_hora DESC);
