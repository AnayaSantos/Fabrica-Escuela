# Preparacion frontend para Spring Boot

Este proyecto contiene una sola aplicacion frontend. No incluye Spring Boot, acceso a PostgreSQL ni persistencia simulada por el cliente HTTP. Las reglas autoritativas y el almacenamiento pertenecen al backend.

## Configuracion

El cliente API compartido usa `VITE_API_BASE_URL`; si no se define, usa `http://localhost:8080`. Configura esa variable en el archivo `.env` de la raiz o en el entorno que inicia Vite. Para desarrollo, el unico origen del frontend es `http://127.0.0.1:5173`; Spring Boot debe permitir ese origen por CORS.

Instala dependencias con `npm ci`, ejecuta `npm run dev` desde la raiz y genera el artefacto de produccion con `npm run build`. El frontend desplegado es una sola aplicacion y una salida `dist/`; el backend continua siendo un servicio independiente.

El cliente comun serializa JSON, admite `204 No Content` y traduce errores HTTP/ProblemDetail a `ApiError`. No reintenta ni inventa respuestas cuando el backend no esta disponible.

## Contratos documentados en el frontend

- HU-01 envia `POST /api/envios` con `EnvioFormData` y espera `{ "numeroGuia": string }`.
- HU-02 consulta `GET /api/envios/{numeroGuia}` y espera `DatosGuia`: guia, eventos y los campos opcionales `fechaEstimadaEntrega` y `alertaTiempo`.
- HU-05 envia `POST /api/usuarios`; el frontend trata `409` como correo duplicado y `400` como datos invalidos.
- HU-13 consume `GET /api/centros-distribucion`, `POST /api/centros-distribucion` y `DELETE /api/centros-distribucion/{id}`. El POST espera `RespuestaServicio<CentroDistribucion>`.
- HU-14 reutiliza `GET /api/centros-distribucion` para origen, destino y paradas. Su `POST /api/rutas` con `RutaTransporte` es una propuesta frontend pendiente de confirmar con Spring.
- HU-15 provee validacion y formato frontend de fecha estimada; HU-01 reutiliza la validacion y HU-02 muestra la fecha que venga en `DatosGuia`.
- HU-19 contiene los estados visuales de alerta de clima/ruta. HU-02 los muestra cuando `DatosGuia.alertaTiempo` viene en la respuesta.

## Contratos propuestos, pendientes de acordar

Estas rutas se prepararon solo en adapters frontend. No son endpoints existentes ni implementados en este repositorio:

- HU-03: `GET /api/envios/{numeroGuia}` y `PATCH /api/envios/{numeroGuia}/estado`, con `{ "estado": EstadoEnvio }` y respuesta `EnvioActualizable`.
- HU-04: `GET /api/envios/{numeroGuia}/eventos`, `POST` al mismo recurso y `DELETE /api/envios/{numeroGuia}/eventos/{eventoId}`.
- HU-07: `GET /api/envios/{numeroGuia}`, `GET /api/rutas`, `GET /api/vehiculos/disponibles` y `POST /api/envios/{numeroGuia}/asignacion` con `rutaId` y `vehiculoId`.

Confirmar rutas, DTOs, codigos de error y reglas de transicion con el equipo Spring antes de conectar ambientes compartidos. No se agrego codigo de backend.
