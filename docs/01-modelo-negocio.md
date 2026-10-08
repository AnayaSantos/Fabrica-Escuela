# Modelo de negocio

Este documento formaliza el dominio que ya aparece en las 4 HU del frontend integrado.
No define entidades por la forma visual de las pantallas, sino por la informacion que el negocio necesita registrar, consultar, actualizar y auditar.

## Historias de usuario cubiertas

### HU-01 - Registrar envio

El usuario registra un envio nuevo indicando:

- Datos del remitente.
- Datos del destinatario.
- Direccion y ciudad de origen.
- Direccion y ciudad de destino.
- Peso del paquete.
- Tipo de servicio.
- Fecha estimada de entrega.

Resultado esperado:

- Se genera un numero de guia unico.
- El envio queda en estado inicial `Pendiente de recoleccion`.
- Se registra un primer evento logistico de creacion.
- El envio queda disponible para consulta, actualizacion e historial.

### HU-02 - Consultar envio

El usuario consulta un envio por numero de guia.

Resultado esperado:

- Si existe, se muestran datos generales del envio y su linea de tiempo.
- Si no existe, se devuelve un error controlado.
- La informacion debe venir del backend y PostgreSQL, no de datos locales.

### HU-03 - Actualizar estado de envio

El usuario cambia el estado operativo de un envio existente.

Resultado esperado:

- Solo se permiten transiciones validas.
- El envio actualiza su estado actual.
- Se crea un evento logistico asociado a la actualizacion.
- La fecha de ultima actualizacion cambia.

### HU-04 - Bitacora de eventos logisticos

El usuario consulta y registra eventos logisticos de una guia.

Resultado esperado:

- Los eventos quedan asociados al envio.
- La bitacora se ordena por fecha y hora.
- Los eventos persisten.
- El registro de ciertos eventos puede afectar el estado actual del envio.

## Entidades del dominio

### Envio

Entidad central del sistema.

Atributos principales:

- `id`: identificador interno.
- `numeroGuia`: identificador publico unico.
- `pesoKg`: peso del paquete.
- `tipoServicio`: `ESTANDAR` o `EXPRESS`.
- `estadoActual`: estado operativo actual.
- `fechaEstimadaEntrega`: fecha prometida o estimada.
- `fechaRegistro`: fecha en que se creo el envio.
- `fechaUltimaActualizacion`: fecha del ultimo cambio relevante.

Justificacion:

- Todas las HU giran alrededor de crear, consultar, modificar o auditar envios.
- Es la entidad que conecta personas, direcciones y eventos.

### Contacto

Representa una persona involucrada en el envio.

Atributos principales:

- `id`.
- `nombre`.
- `documento`.
- `telefono`.

Roles posibles:

- Remitente.
- Destinatario.

Justificacion:

- Remitente y destinatario tienen la misma estructura de datos.
- Separar esta informacion evita duplicar columnas de persona directamente en tablas futuras si se reutiliza el contacto.

### Direccion

Representa un punto geografico operativo del envio.

Atributos principales:

- `id`.
- `direccion`.
- `ciudad`.

Roles posibles:

- Origen.
- Destino.

Justificacion:

- El envio necesita una direccion de origen y una de destino.
- La direccion puede evolucionar despues con departamento, pais, codigo postal o coordenadas sin afectar la tabla principal de envios.

### EventoLogistico

Representa un hecho ocurrido durante el ciclo de vida del envio.

Atributos principales:

- `id`.
- `envioId`.
- `fechaHora`.
- `tipoEvento`.
- `estadoResultante`.
- `ubicacion`.
- `detalle`.

Justificacion:

- La HU-02 necesita una linea de tiempo.
- La HU-04 necesita una bitacora persistente.
- La HU-03 debe generar evidencia historica cuando cambia el estado.

## Relaciones

- Un `Envio` tiene un `Contacto` remitente.
- Un `Envio` tiene un `Contacto` destinatario.
- Un `Envio` tiene una `Direccion` de origen.
- Un `Envio` tiene una `Direccion` de destino.
- Un `Envio` tiene muchos `EventoLogistico`.
- Un `EventoLogistico` pertenece a un solo `Envio`.

## Reglas de negocio

### Registro de envio

- Todos los campos del formulario de registro son obligatorios.
- `pesoKg` debe ser mayor que cero.
- `tipoServicio` solo puede ser `ESTANDAR` o `EXPRESS`.
- `numeroGuia` debe ser unico.
- Todo envio nuevo inicia en `Pendiente de recoleccion`.
- Todo envio nuevo debe crear un evento inicial `CREADO`.

### Consulta

- La busqueda se realiza por `numeroGuia`.
- Si la guia no existe, debe responderse con un error 404.
- La linea de tiempo debe salir de eventos logisticos persistidos.

### Actualizacion de estado

Transiciones validas:

| Estado actual | Estados permitidos |
| --- | --- |
| Pendiente de recoleccion | En transito, Con incidencia |
| En transito | En reparto, Con incidencia, Devuelto |
| En reparto | Entregado, Con incidencia, Devuelto |
| Entregado | Ninguno |
| Con incidencia | En transito, En reparto, Devuelto |
| Devuelto | Ninguno |

Reglas:

- No se puede actualizar una guia inexistente.
- No se puede repetir una transicion invalida.
- Estados finales como `Entregado` y `Devuelto` no permiten nuevos cambios de estado operativo.
- Cada cambio valido genera un evento logistico.

### Eventos logisticos

- Todo evento debe pertenecer a un envio existente.
- `tipoEvento` debe pertenecer al catalogo permitido.
- `ubicacion` es obligatoria.
- `detalle` es opcional.
- La fecha y hora debe generarse en backend.
- Los eventos se muestran del mas reciente al mas antiguo en historial y en orden cronologico para la linea de tiempo.

## Datos actualmente simulados

En `src/services/shipmentStore.ts` hoy estan simulados:

- La base de datos local.
- La guia demo `LG-2026-00000001`.
- La generacion de numeros de guia.
- La persistencia mediante `localStorage`.
- La consulta de envio.
- La actualizacion de estado.
- El registro y eliminacion de eventos.

## Datos que deben persistirse en PostgreSQL

- Envios.
- Contactos de remitente y destinatario.
- Direcciones de origen y destino.
- Eventos logisticos.
- Estados actuales e historicos.
- Fechas de registro y actualizacion.
- Numero de guia unico.

