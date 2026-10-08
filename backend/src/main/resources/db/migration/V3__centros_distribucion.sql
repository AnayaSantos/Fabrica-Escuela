-- La unicidad case-insensitive (mismo nombre+ciudad+direccion sin importar mayusculas) se valida
-- en CentroDistribucionService antes de guardar. El UNIQUE plano aqui es una defensa adicional a
-- nivel de base de datos contra condiciones de carrera con el mismo valor exacto; un indice
-- funcional con LOWER() se descarto porque H2 (usado en los tests) no soporta esa sintaxis en
-- CREATE INDEX.
CREATE TABLE centros_distribucion (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    ciudad VARCHAR(80) NOT NULL,
    direccion VARCHAR(180) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_centros_distribucion_nombre_ciudad_direccion UNIQUE (nombre, ciudad, direccion)
);
