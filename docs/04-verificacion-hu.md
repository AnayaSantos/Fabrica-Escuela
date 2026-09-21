# Verificacion de HU

Estado despues de la implementacion del backend en `frontend-integrado/backend`.

| HU | Frontend | API | Logica de negocio | PostgreSQL | Extremo a extremo |
| --- | --- | --- | --- | --- | --- |
| HU-01 Registro | Implementado | `POST /api/envios` | Implementada | Configurado por JPA/PostgreSQL | Pendiente de probar con PostgreSQL real |
| HU-02 Consulta | Implementado | `GET /api/envios/{numeroGuia}` | Implementada | Configurado por JPA/PostgreSQL | Pendiente de probar con PostgreSQL real |
| HU-03 Actualizacion | Implementado | `PATCH /api/envios/{numeroGuia}/estado` | Implementada | Configurado por JPA/PostgreSQL | Pendiente de probar con PostgreSQL real |
| HU-04 Historial | Implementado | `GET/POST/DELETE /api/envios/{numeroGuia}/eventos` | Implementada | Configurado por JPA/PostgreSQL | Pendiente de probar con PostgreSQL real |

## Verificaciones realizadas

- Frontend compila con `npm run build`.
- Backend compila con `mvn -DskipTests package`.
- Pruebas backend pasan con `mvn test`:
  - Contexto Spring Boot.
  - Flujo de servicio: registrar, consultar y actualizar envio.
  - Flujo REST de las 4 HU: registro, consulta, actualizacion e historial.
- La capa frontend puede usar `localStorage` o API REST mediante `VITE_DATA_SOURCE`.
- El backend expone controllers, services, repositories, entities, DTOs y manejo de errores.
- Docker Compose queda definido para frontend, backend y PostgreSQL.

## Pendientes por limitacion del entorno

- Docker no esta instalado en esta maquina, por lo que no se pudo ejecutar `docker compose up --build`.
- PostgreSQL no esta instalado ni activo en `localhost:5432`.
- La instalacion de PostgreSQL por Chocolatey fallo por falta de permisos de administrador.
- No se pudo comprobar la persistencia real contra PostgreSQL desde este entorno.

## Comandos sugeridos para validacion completa

```bash
docker compose up --build
```

Despues, abrir:

```text
http://localhost:5173
```

Flujo esperado:

1. Crear un envio desde HU-01.
2. Consultar la guia creada desde HU-02.
3. Actualizar su estado desde HU-03.
4. Registrar un evento desde HU-04.
5. Reiniciar los contenedores.
6. Consultar nuevamente la misma guia y confirmar que sigue existiendo.
