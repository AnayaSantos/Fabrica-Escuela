# Modelo de datos PostgreSQL

Este diseño corresponde al modelo de negocio identificado para las 4 HU actuales.
La implementacion final puede ajustarse durante el backend, pero cualquier cambio debe mantenerse sincronizado con este documento y con el diagrama ER.

## Tablas propuestas

### contactos

Almacena remitentes y destinatarios.

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| nombre | VARCHAR(120) | NOT NULL |
| documento | VARCHAR(40) | NOT NULL |
| telefono | VARCHAR(40) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

Notas:

- `documento` no se marca unico globalmente porque la misma persona puede aparecer varias veces en prototipos academicos sin una gestion formal de clientes.
- Si luego existe una HU de clientes, se puede normalizar hacia una entidad `cliente`.

### direcciones

Almacena origenes y destinos.

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| direccion | VARCHAR(180) | NOT NULL |
| ciudad | VARCHAR(80) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

### envios

Entidad principal del sistema.

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| numero_guia | VARCHAR(30) | NOT NULL, UNIQUE |
| remitente_id | BIGINT | NOT NULL, FK contactos(id) |
| destinatario_id | BIGINT | NOT NULL, FK contactos(id) |
| direccion_origen_id | BIGINT | NOT NULL, FK direcciones(id) |
| direccion_destino_id | BIGINT | NOT NULL, FK direcciones(id) |
| peso_kg | NUMERIC(10,2) | NOT NULL, CHECK > 0 |
| tipo_servicio | VARCHAR(20) | NOT NULL |
| estado_actual | VARCHAR(40) | NOT NULL |
| fecha_estimada_entrega | DATE | NOT NULL |
| fecha_registro | TIMESTAMP | NOT NULL |
| fecha_ultima_actualizacion | TIMESTAMP | NOT NULL |

Restricciones sugeridas:

- `tipo_servicio IN ('ESTANDAR', 'EXPRESS')`.
- `estado_actual IN ('PENDIENTE_RECOLECCION', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO', 'CON_INCIDENCIA', 'DEVUELTO')`.
- `peso_kg > 0`.

### eventos_logisticos

Bitacora historica de cada envio.

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| envio_id | BIGINT | NOT NULL, FK envios(id) ON DELETE CASCADE |
| fecha_hora | TIMESTAMP | NOT NULL |
| tipo_evento | VARCHAR(40) | NOT NULL |
| estado_resultante | VARCHAR(40) | NULL |
| ubicacion | VARCHAR(120) | NOT NULL |
| detalle | VARCHAR(250) | NULL |

Restricciones sugeridas:

- `tipo_evento IN ('CREADO', 'PREPARANDO', 'EN_BODEGA', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO', 'CON_INCIDENCIA', 'DEVUELTO')`.
- Indice por `(envio_id, fecha_hora DESC)` para consultar historial.

## Cardinalidades

| Relacion | Cardinalidad |
| --- | --- |
| contacto remitente -> envios | 1 contacto puede aparecer en N envios |
| contacto destinatario -> envios | 1 contacto puede aparecer en N envios |
| direccion origen -> envios | 1 direccion puede aparecer en N envios |
| direccion destino -> envios | 1 direccion puede aparecer en N envios |
| envio -> eventos_logisticos | 1 envio tiene N eventos |

## SQL base sugerido

```sql
CREATE TABLE contactos (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  documento VARCHAR(40) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE direcciones (
  id BIGSERIAL PRIMARY KEY,
  direccion VARCHAR(180) NOT NULL,
  ciudad VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE envios (
  id BIGSERIAL PRIMARY KEY,
  numero_guia VARCHAR(30) NOT NULL UNIQUE,
  remitente_id BIGINT NOT NULL REFERENCES contactos(id),
  destinatario_id BIGINT NOT NULL REFERENCES contactos(id),
  direccion_origen_id BIGINT NOT NULL REFERENCES direcciones(id),
  direccion_destino_id BIGINT NOT NULL REFERENCES direcciones(id),
  peso_kg NUMERIC(10,2) NOT NULL CHECK (peso_kg > 0),
  tipo_servicio VARCHAR(20) NOT NULL CHECK (tipo_servicio IN ('ESTANDAR', 'EXPRESS')),
  estado_actual VARCHAR(40) NOT NULL,
  fecha_estimada_entrega DATE NOT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE eventos_logisticos (
  id BIGSERIAL PRIMARY KEY,
  envio_id BIGINT NOT NULL REFERENCES envios(id) ON DELETE CASCADE,
  fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo_evento VARCHAR(40) NOT NULL,
  estado_resultante VARCHAR(40),
  ubicacion VARCHAR(120) NOT NULL,
  detalle VARCHAR(250)
);

CREATE INDEX idx_eventos_logisticos_envio_fecha
  ON eventos_logisticos (envio_id, fecha_hora DESC);
```

## Decisiones de diseño

- `numero_guia` es unico porque es la clave publica de consulta.
- Los eventos se separan de `envios` para conservar historial completo.
- `estado_actual` se guarda en `envios` por eficiencia de consulta, pero debe mantenerse consistente con los eventos desde el servicio de negocio.
- Contactos y direcciones se separan para evitar que `envios` concentre responsabilidades de personas, ubicaciones, estado e historial.

