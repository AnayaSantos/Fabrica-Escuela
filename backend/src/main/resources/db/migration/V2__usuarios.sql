CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(160) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_usuarios_correo UNIQUE (correo),
    CONSTRAINT chk_usuarios_rol CHECK (rol IN ('ADMINISTRADOR', 'OPERADOR_LOGISTICO', 'CLIENTE'))
);
