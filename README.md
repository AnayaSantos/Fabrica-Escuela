# Frontend integrado de HU

Esta carpeta integra las pantallas que estaban separadas en las contribuciones `HU-01`, `HU-02`, `HU-3` y `HU-04`.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Luego abre `http://localhost:5173`.

## Ejecutar sistema completo con Docker

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Que incluye

- `HU-01`: registro de un nuevo envio.
- `HU-02`: consulta de envio por numero de guia.
- `HU-03`: actualizacion del estado de un envio.
- `HU-04`: bitacora de eventos logisticos.

La app usa `localStorage` como base de datos local para que pueda probarse sin backend.

Para preparar conexion con backend real, copia `.env.example` como `.env` y cambia:

```bash
VITE_DATA_SOURCE=api
VITE_API_URL=http://localhost:8080
```

## Estado actual

- Frontend integrado: implementado para `HU-01` a `HU-04` (sin cambios en este sprint).
- Backend Spring Boot: implementado en `backend/`.
- API REST: implementada para las 4 HU originales + 5 HU del Sprint 2 (`HU-005`, `HU-007`, `HU-013`,
  `HU-014`, `HU-015`), estas ultimas solo a nivel de API — sin pantallas nuevas en el frontend.
- Autenticacion: login + JWT + roles (Administrador/Operador logistico/Cliente) implementados.
- Esquema de base de datos: gestionado por Flyway (`backend/src/main/resources/db/migration/`), ya no
  por `ddl-auto=update`.
- PostgreSQL: configurado por Docker.
- Persistencia real: verificada extremo a extremo con Docker/PostgreSQL, incluyendo arranque desde una
  base de datos completamente nueva (ver `docs/05-verificacion-hu-sprint2.md`).

## Documentacion de avance

- [Modelo de negocio](docs/01-modelo-negocio.md)
- [Modelo de datos PostgreSQL](docs/02-modelo-datos-postgresql.md)
- [API REST y arquitectura](docs/03-api-rest-y-arquitectura.md)
- [Verificacion de HU](docs/04-verificacion-hu.md)
- [Verificacion de HU — Sprint 2](docs/05-verificacion-hu-sprint2.md)
- [Diagrama ER editable](docs/diagrama-er.drawio)
- [Diagrama ER PNG](docs/diagrama-er.png)

## Siguiente paso tecnico

Validar el flujo extremo a extremo con Docker/PostgreSQL ejecutando `docker compose up --build`. El frontend ya cuenta con `src/services/shipmentService.ts`, que puede usar `localStorage` o API REST segun `VITE_DATA_SOURCE`.
