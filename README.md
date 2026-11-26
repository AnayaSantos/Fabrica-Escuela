# Sistema de gestion de envios (TraceLog)

Frontend integrado (carpeta `Frontend/`) + backend Spring Boot (carpeta `backend/`), conectados a un
backend real con autenticacion JWT.

## Ejecutar localmente

Backend (requiere PostgreSQL, ver `docker-compose.yml` para levantar solo la base de datos):

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd Frontend
npm install
npm run dev
```

Luego abre `http://localhost:5173`. Admin sembrado por defecto: `admin@envios.local` / `Admin123!`
(configurable con `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`).

## Ejecutar sistema completo con Docker

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Que incluye

- `HU-01` a `HU-04`: registro, consulta, actualizacion de estado y bitacora de eventos de un envio.
- `HU-005`: autenticacion de usuarios (login JWT) y registro de usuarios (solo administrador).
- `HU-007`: asignacion de transporte (ruta + vehiculo) a un envio.
- `HU-013`: gestion de centros de distribucion.
- `HU-014`: gestion de rutas de transporte.
- `HU-015`: fecha estimada de entrega.
- `HU-19`: alerta visual de tiempo de entrega (solo frontend, sin endpoint propio en el backend).

Variable de entorno del frontend: `VITE_API_BASE_URL` (URL base del backend, ver `.env.example`).

## Estado actual

- Frontend integrado: todas las HU listadas arriba, conectadas al backend real (sin modo local/mock).
- Backend Spring Boot: implementado en `backend/`.
- API REST: implementada para las 4 HU originales + 5 HU del Sprint 2 (`HU-005`, `HU-007`, `HU-013`,
  `HU-014`, `HU-015`).
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

## Despliegue

Ver `render.yaml` para el blueprint de despliegue en Render (backend + frontend + PostgreSQL).
