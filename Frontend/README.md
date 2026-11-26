# TraceLog Frontend

TraceLog is a single React and TypeScript application built with Vite. All ten HU screens run in one browser origin; the main menu navigates between the eight existing menu modules without iframes or additional frontend servers. HU-15 and HU-19 remain available at `/#/hu-15` and `/#/hu-19`.

## Project layout

The project root contains the frontend dependencies and configuration alongside `src/`; install, run, test, and build commands from this `Frontend/` directory. The sibling `Backend/` directory is reserved for backend code and is currently empty.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

## Install and run

```sh
npm ci
npm run dev
```

Vite serves the frontend at `http://127.0.0.1:5173`. The configured port is strict: startup fails if it is already occupied rather than silently selecting another port.

## Admin test account

Use this local-only account to show all eight stories in the navigation menu:

- Email: `admin@gmail.com`
- Password: `123`

This credential is hard-coded in the frontend for local testing only. It is not authentication and must not be used in production.

## Backend URL

The backend remains a separate service. Set `VITE_API_BASE_URL` in a root `.env` file or the frontend process environment. Copy `.env.example` to `.env` to use the local backend default:

```env
VITE_API_BASE_URL=http://localhost:8080
```

If the variable is unset, the shared API client continues to use `http://localhost:8080`.

## Routes

| Screen | URL |
| --- | --- |
| Registrar Envío (HU-01) | `/#/hu-01` |
| Consultar Envío (HU-02) | `/#/hu-02` |
| Actualizar Estado (HU-03) | `/#/hu-03` |
| Registrar Evento (HU-04) | `/#/hu-04` |
| Registrar Usuario (HU-05) | `/#/hu-05` |
| Asignación de Transporte (HU-07) | `/#/hu-07` |
| Centros de Distribución (HU-13) | `/#/hu-13` |
| Registrar Ruta de Transporte (HU-14) | `/#/hu-14` |
| Fecha Estimada de Entrega (HU-15) | `/#/hu-15` |
| Alerta de Tiempo de Entrega (HU-19) | `/#/hu-19` |

The hash-based routes work on direct access and reload without requiring server-side route rewrites.

## Checks and production build

```sh
npm test
npm run lint
npm run build
npm run preview
```

The production frontend is emitted to the single root `dist/` directory. Preview serves it at `http://127.0.0.1:4173`.
