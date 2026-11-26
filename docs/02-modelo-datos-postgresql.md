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

---

## Sprint 2 — Tablas nuevas (HU-005, HU-013, HU-014, HU-007)

A partir de la Fase 1 del Sprint 2 el esquema deja de gestionarse con `ddl-auto=update` y pasa a
gestionarse con **Flyway** (`backend/src/main/resources/db/migration/`). El baseline de las 4 tablas
originales quedo fijado en `V1__baseline_schema.sql`; cada tabla nueva de esta seccion tiene su propia
migracion (`V2` a `V6`), y cualquier cambio de esquema futuro debe seguir el mismo patron en vez de
editar las entidades JPA directamente.

### usuarios (HU-005, migracion `V2`)

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| nombre | VARCHAR(120) | NOT NULL |
| correo | VARCHAR(160) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(100) | NOT NULL (BCrypt, nunca se expone en la API) |
| rol | VARCHAR(30) | NOT NULL, CHECK IN ('ADMINISTRADOR', 'OPERADOR_LOGISTICO', 'CLIENTE') |
| activo | BOOLEAN | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Sin relaciones hacia otras tablas. El primer administrador se crea automaticamente al arrancar la
aplicacion (`AdminSeeder`) si la tabla esta vacia, usando las variables de entorno
`ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` (con defaults de desarrollo, igual que las credenciales de
base de datos en `application.properties`).

### centros_distribucion (HU-013, migracion `V3`)

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| nombre | VARCHAR(150) | NOT NULL |
| ciudad | VARCHAR(80) | NOT NULL |
| direccion | VARCHAR(180) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

`UNIQUE(nombre, ciudad, direccion)` a nivel de base de datos como defensa adicional; la deteccion de
duplicados case-insensitive (CA-13-B) se valida en `CentroDistribucionService`. No se puede eliminar un
centro referenciado como origen, destino o parada de alguna `ruta` (regla agregada en la Fase 5, al
introducir `rutas`).

### rutas (HU-014, migracion `V4`)

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| nombre | VARCHAR(150) | NOT NULL |
| centro_origen_id | BIGINT | NOT NULL, FK centros_distribucion(id) |
| centro_destino_id | BIGINT | NOT NULL, FK centros_distribucion(id) |
| activa | BOOLEAN | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

`CHECK(centro_origen_id <> centro_destino_id)` (CA-14-B). Las paradas intermedias (CA-14-C) viven en
`paradas_ruta`, gestionadas como agregado desde `Ruta` (a diferencia de `eventos_logisticos`, que es un
historial independiente de `envios`, las paradas se reemplazan completas en cada actualizacion de ruta).

### paradas_ruta (HU-014, migracion `V4`)

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| ruta_id | BIGINT | NOT NULL, FK rutas(id) ON DELETE CASCADE |
| centro_distribucion_id | BIGINT | NOT NULL, FK centros_distribucion(id) |
| orden | INT | NOT NULL |

`UNIQUE(ruta_id, orden)` garantiza que no haya dos paradas con el mismo orden dentro de la misma ruta.

### vehiculos (prerequisito implicito de HU-007, migracion `V5`)

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| placa | VARCHAR(20) | NOT NULL, UNIQUE |
| conductor | VARCHAR(120) | NOT NULL |
| tipo | VARCHAR(40) | NOT NULL |
| activo | BOOLEAN | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

Sin HU propia: es prerequisito de HU-007 confirmado a partir de `docs/Asignacion de rutas por camion.md`.

### vehiculo_rutas (relacion M:N, migracion `V5`)

Tabla de union `(vehiculo_id, ruta_id)`, ambas FK, sin entidad Java dedicada. Representa que rutas puede
cubrir cada vehiculo. **Es puramente informativa**: HU-007 no la exige como restriccion dura al asignar
transporte (decision confirmada), por lo que no bloquea ninguna asignacion.

### asignaciones_transporte (HU-007, migracion `V6`)

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| id | BIGSERIAL | PK |
| envio_id | BIGINT | NOT NULL, FK envios(id), **UNIQUE** |
| ruta_id | BIGINT | NOT NULL, FK rutas(id) |
| vehiculo_id | BIGINT | NOT NULL, FK vehiculos(id) |
| fecha_asignacion | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

`UNIQUE(envio_id)` modela "una asignacion activa por envio": reasignar ruta/vehiculo es un `UPDATE`
(upsert) sobre la misma fila, no se crea una tabla de historial porque ningun criterio de aceptacion lo
exige. Solo se permite crear/actualizar la asignacion si el envio esta en `PENDIENTE_RECOLECCION`
(`AsignacionTransportePolicy`); esto cubre tambien el caso "en centro de distribucion" de la HU, que en
el modelo actual equivale a `PENDIENTE_RECOLECCION` (ver `TipoEventoLogistico.EN_BODEGA`). No se agrego
ningun valor nuevo a `estado_actual` de `envios` para este sprint.

### Datos de simulacion cargados automaticamente

`SimulacionSeeder` carga, solo si `vehiculos` esta vacia, los datos de
`docs/Asignacion de rutas por camion.md`: un `centro_distribucion` por cada una de las 15 ciudades
mencionadas (nombre `Centro de Distribución <Ciudad>`, direccion `Sede principal (simulado)`), los 5
`vehiculos` con sus placas reales (ABC-123, DEF-456, GHI-789, JKL-321, MNO-654), y las 18 `rutas`
correspondientes a los tramos documentados, vinculadas a cada vehiculo via `vehiculo_rutas`. Son datos
de simulacion explicitamente marcados como ajustables, no direcciones reales de produccion.

### Deuda tecnica heredada (no corregida en este sprint)

`EventoLogisticoService.registrar()` sigue actualizando `estado_actual` de `envios` sin pasar por
`EstadoTransitionPolicy`, a diferencia de `EnvioService.actualizarEstado()` que si valida la transicion.
Esta inconsistencia ya existia antes del Sprint 2; ninguna HU de este sprint la toca, por lo que se deja
documentada como riesgo heredado en vez de corregirse fuera de alcance.

