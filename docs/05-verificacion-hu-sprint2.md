# Verificacion de HU — Sprint 2

Estado despues de implementar el backend de las 5 HU nuevas del Sprint 2 (HU-005, HU-007, HU-013,
HU-014, HU-015) sobre el backend existente (HU-01 a HU-04), siguiendo el plan de fases de
`ancient-wobbling-valiant.md`. A diferencia de la verificacion del Sprint 1 (`04-verificacion-hu.md`),
en este entorno Docker y PostgreSQL si estaban disponibles, por lo que toda fila de esta tabla fue
probada extremo a extremo contra el contenedor real `hu-envios-db` (PostgreSQL 16), no solo contra H2.

| HU | API | Logica de negocio | PostgreSQL real | Extremo a extremo |
| --- | --- | --- | --- | --- |
| HU-005 Usuarios/Auth | `POST /api/auth/login`, `POST/GET /api/usuarios` | Implementada (correo unico, rol valido, BCrypt) | Migracion `V2` aplicada | Verificado: login admin sembrado, 401 sin token, 403 por rol, usuario creado sin `passwordHash` |
| HU-007 Asignacion de transporte | `POST/GET /api/envios/{numeroGuia}/asignacion-transporte` | Implementada (`AsignacionTransportePolicy`) | Migracion `V6` aplicada | Verificado: asignacion exitosa, 400 campos vacios, 409 con envio `ENTREGADO` |
| HU-013 Centros de distribucion | `POST/GET/GET{id}/PUT/DELETE /api/centros-distribucion` | Implementada (duplicados, campos obligatorios) | Migracion `V3` aplicada | Verificado: CRUD completo, 409 duplicado, 400 campo vacio, bloqueo de borrado si esta referenciado |
| HU-014 Rutas de transporte | `POST/GET/GET{id}/PUT/DELETE /api/rutas`, `/api/vehiculos` | Implementada (origen≠destino, orden de paradas) | Migraciones `V4`/`V5` aplicadas | Verificado: orden de paradas persistido correctamente, datos de simulacion cargados (15 centros, 5 vehiculos, 18 rutas) |
| HU-015 Fecha estimada | `POST /api/envios` (regla nueva), `GET /api/envios/{numeroGuia}` (campo agregado) | Implementada | Sin cambio de esquema | Verificado: fecha pasada rechazada, fecha futura expuesta en la consulta publica |

## Verificaciones realizadas

- Backend compila con `mvn -DskipTests compile` dentro de un contenedor `maven:3.9.9-eclipse-temurin-21`
  (no hay Maven/Java 21 instalados en el host Windows de este entorno).
- Suite completa de pruebas (`mvn test`) en verde: **49/49**, incluyendo los 3 tests originales del
  Sprint 1 (migrados para enviar autenticacion) y los nuevos de cada HU del Sprint 2.
- `docker compose up --build backend` ejecutado repetidamente contra el PostgreSQL real
  (`hu-envios-db`), confirmando en cada fase:
  - Flyway aplica las migraciones `V1`-`V6` sin errores (`V1` se aplico como *baseline* sobre el
    esquema ya existente del Sprint 1; `V2`-`V6` se migraron normalmente).
  - `spring.jpa.hibernate.ddl-auto=validate` no reporta inconsistencias.
  - Los endpoints responden los codigos HTTP esperados por cada criterio de aceptacion (200/201/400/
    401/403/404/409) usando `curl` real contra `localhost:8080`.
- Ningun test quedo deshabilitado (`@Disabled`) ni se detectaron tests comentados.
- `ApiExceptionHandler` cubre todas las excepciones nuevas (`RecursoDuplicadoException` → 409,
  `RecursoNoEncontradoException` → 404, `AsignacionTransporteNoPermitidaException` → 409,
  `AuthenticationException` → 401) con el mismo formato `ErrorResponse` que las excepciones del
  Sprint 1.
- Se verifico explicitamente que ninguna respuesta JSON de `/api/usuarios` expone `passwordHash`.
- `CorsConfig.allowedMethods` incluye `PUT` (requerido por los CRUD nuevos).

## Hallazgos corregidos durante la implementacion (no asumidos, verificados en el codigo real)

- `DatosGuiaResponse` (el DTO de `GET /api/envios/{numeroGuia}`) no incluia `fechaEstimadaEntrega`
  pese a que CA-15-C lo exige — corregido en la Fase 2.
- El fixture de test `"fechaEstimadaEntrega": "2026-09-24"` ya estaba en el pasado respecto a la fecha
  del sistema — corregido a una fecha relativa (`LocalDate.now().plusDays(N)`) antes de que la
  validacion de HU-015 lo hiciera fallar.
- El esquema real (verificado via `pg_dump --schema-only` contra `hu-envios-db`) no coincidia del todo
  con `docs/02-modelo-datos-postgresql.md`: el FK `eventos_logisticos.envio_id` no tiene
  `ON DELETE CASCADE` en la base real, y H2 no soporta indices funcionales con `LOWER()` en
  `CREATE INDEX` (se uso `UNIQUE` plano en su lugar). El baseline `V1` y la migracion `V3` reflejan la
  realidad verificada, no la documentacion previa.
- "En centro de distribucion" (texto de HU-007) no es un estado de `EstadoEnvio`; se confirmo que ya
  equivale a `PENDIENTE_RECOLECCION` via `TipoEventoLogistico.EN_BODEGA`, por lo que no se agrego
  ningun estado nuevo.

## Deuda tecnica heredada (documentada, no corregida — fuera de alcance de este sprint)

`EventoLogisticoService.registrar()` sigue actualizando el estado del envio sin pasar por
`EstadoTransitionPolicy`, a diferencia de `EnvioService.actualizarEstado()`. Esta inconsistencia es
anterior al Sprint 2 y ninguna HU nueva la toca.

## Decisiones de alcance tomadas durante la implementacion

- `GET /api/envios/{numeroGuia}` permanece publico (sin autenticacion), confirmado con el usuario.
- La asignacion de transporte (HU-007) solo se permite con el envio en `PENDIENTE_RECOLECCION`.
- La relacion vehiculo↔rutas-habilitadas (`vehiculo_rutas`) es informativa, no restrictiva.
- Se omitio el campo opcional `usuario_asigno_id` en `asignaciones_transporte` (mencionado como
  opcional en el plan): ningun criterio de aceptacion de HU-007 lo exige.
- La autorizacion por rol se centralizo en `SecurityConfig` (matriz de rutas), en vez de anotar cada
  controlador individualmente con `@PreAuthorize`: mismo resultado, menos archivos modificados.

## Como volver a validar manualmente

```bash
docker compose up --build
```

Con el stack arriba:

1. `POST /api/auth/login` con el administrador sembrado (`admin@envios.local` / `Admin123!` por
   defecto en desarrollo, sobreescribible con `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`).
2. Usar el token para crear un envio (`POST /api/envios`) con fecha estimada futura.
3. Confirmar que `GET /api/envios/{numeroGuia}` (sin token) expone `fechaEstimadaEntrega`.
4. Asignar transporte usando una ruta y vehiculo ya sembrados por `SimulacionSeeder`
   (`GET /api/rutas`, `GET /api/vehiculos`).
5. Avanzar el envio hasta `Entregado` (`PATCH /estado`) y confirmar que una nueva asignacion de
   transporte responde `409`.
