# API REST y arquitectura por capas

Este documento define como deberia conectarse el frontend integrado con un backend Spring Boot real.

## Arquitectura objetivo

```text
Frontend React
   ↓ HTTP/JSON
Controller Spring Boot
   ↓
Service
   ↓
Repository
   ↓
PostgreSQL
```

## Paquetes sugeridos para Spring Boot

```text
src/main/java/.../envios/
  controller/
    EnvioController.java
    EventoLogisticoController.java
  service/
    EnvioService.java
    EventoLogisticoService.java
    NumeroGuiaService.java
  repository/
    EnvioRepository.java
    ContactoRepository.java
    DireccionRepository.java
    EventoLogisticoRepository.java
  entity/
    Envio.java
    Contacto.java
    Direccion.java
    EventoLogistico.java
  dto/
    RegistrarEnvioRequest.java
    RegistrarEnvioResponse.java
    EnvioDetalleResponse.java
    ActualizarEstadoRequest.java
    EventoLogisticoRequest.java
    EventoLogisticoResponse.java
  exception/
    ApiExceptionHandler.java
    EnvioNoEncontradoException.java
    TransicionEstadoInvalidaException.java
```

## Responsabilidades por capa

### Controller

- Expone endpoints REST.
- Recibe requests y parametros.
- Devuelve codigos HTTP adecuados.
- No contiene reglas principales de negocio.

### Service

- Genera numero de guia.
- Valida campos obligatorios.
- Valida transiciones de estado.
- Crea eventos logisticos derivados.
- Coordina varias entidades y repositorios.

### Repository

- Accede a PostgreSQL mediante Spring Data JPA.
- Busca por `numeroGuia`.
- Persiste envios, contactos, direcciones y eventos.

### Entity

- Representa las tablas persistentes.
- Contiene relaciones JPA.
- No debe mezclarse con DTOs de entrada/salida.

### DTO

- Separa la API publica del modelo persistente.
- Evita exponer entidades JPA directamente al frontend.

## Endpoints propuestos

### Registrar envio

```text
POST /api/envios
```

Proposito:

- Crear un envio completo desde HU-01.

Entrada:

```json
{
  "nombreRemitente": "Laura Gomez",
  "documentoRemitente": "1020456789",
  "telefonoRemitente": "3005550190",
  "direccionOrigen": "Calle 72 #10-34",
  "ciudadOrigen": "Bogota",
  "nombreDestinatario": "Carlos Perez",
  "documentoDestinatario": "80123456",
  "telefonoDestinatario": "3105550144",
  "direccionDestino": "Carrera 43A #7-50",
  "ciudadDestino": "Medellin",
  "peso": "2.5",
  "tipoServicio": "EXPRESS",
  "fechaEstimadaEntrega": "2026-09-24"
}
```

Salida:

```json
{
  "numeroGuia": "LG-2026-00000002"
}
```

Errores:

- `400 Bad Request` si faltan campos o el peso es invalido.

### Listar envios

```text
GET /api/envios
```

Proposito:

- Alimentar selectores y resumen general del frontend.

Salida:

```json
[
  {
    "numeroGuia": "LG-2026-00000001",
    "estadoActual": "EN_REPARTO",
    "remitente": "Laura Gomez",
    "destinatario": "Carlos Perez"
  }
]
```

### Consultar guia

```text
GET /api/envios/{numeroGuia}
```

Proposito:

- Resolver HU-02.

Salida:

```json
{
  "numeroGuia": "LG-2026-00000001",
  "estadoActual": "EN_REPARTO",
  "remitente": "Laura Gomez",
  "destinatario": "Carlos Perez",
  "origen": "Bogota",
  "destino": "Medellin",
  "eventos": [
    {
      "titulo": "CREADO",
      "fechaHora": "2026-09-03T09:00:00",
      "completado": true
    }
  ]
}
```

Errores:

- `404 Not Found` si la guia no existe.

### Actualizar estado

```text
PATCH /api/envios/{numeroGuia}/estado
```

Proposito:

- Resolver HU-03.

Entrada:

```json
{
  "nuevoEstado": "EN_REPARTO"
}
```

Salida:

```json
{
  "numeroGuia": "LG-2026-00000001",
  "estadoActual": "EN_REPARTO",
  "fechaUltimaActualizacion": "2026-09-20T14:30:00"
}
```

Errores:

- `404 Not Found` si la guia no existe.
- `409 Conflict` si la transicion de estado no es valida.

### Listar eventos logisticos

```text
GET /api/envios/{numeroGuia}/eventos
```

Proposito:

- Consultar bitacora de HU-04.

Errores:

- `404 Not Found` si la guia no existe.

### Registrar evento logistico

```text
POST /api/envios/{numeroGuia}/eventos
```

Proposito:

- Registrar novedades desde HU-04.

Entrada:

```json
{
  "tipoEvento": "EN_BODEGA",
  "ubicacion": "Bodega Bogota",
  "detalle": "Clasificado"
}
```

Errores:

- `400 Bad Request` si el tipo de evento o ubicacion son invalidos.
- `404 Not Found` si la guia no existe.

### Eliminar evento logistico

```text
DELETE /api/envios/{numeroGuia}/eventos/{eventoId}
```

Proposito:

- Mantener la accion actual de HU-04.

Nota:

- En un sistema real esta accion podria requerir auditoria o soft delete.
- Por ahora se conserva porque la HU actual ya ofrece eliminar eventos.

## Criterios SOLID aplicados al diseño

- SRP: Controllers, Services, Repositories, Entities y DTOs tienen responsabilidades separadas.
- OCP: Las reglas de transicion pueden vivir en un servicio o componente dedicado, permitiendo agregar estados sin reescribir controladores.
- LSP: No se propone herencia innecesaria.
- ISP: No se crean interfaces grandes; solo se justifican cuando una abstraccion real aporte valor.
- DIP: Services dependen de repositorios inyectados por Spring, no de detalles manuales de conexion.
