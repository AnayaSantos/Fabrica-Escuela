## HU-005 Registrar un nuevo usuario del sistema con su rol correspondiente

Como administrador del sistema

Quiero registrar nuevos usuarios asignándoles un rol

Para gestionar los accesos y permisos según las responsabilidades de cada persona en la plataforma

### Descripción

El sistema debe permitir crear usuarios con los roles de Administrador, Operador Logístico o Cliente, almacenando sus datos básicos y asignando los permisos correspondientes.

### Acceptance Criteria

CA-05- Registro de nuevos usuarios y asignación de roles

#### Escenario 1: CA-05-A- Registro exitoso

Dado que soy un administrador autenticado en el panel de gestión de usuarios

Cuando ingreso los datos obligatorios (nombre, correo válido, contraseña) y selecciono un rol válido (Administrador, Operador Logístico o Cliente)

Y presiono el botón "Registrar usuario"

Entonces el sistema almacena el usuario de forma segura cifrando su contraseña

Y le asigna los permisos correspondientes al rol seleccionado

Y muestra un mensaje de confirmación de “creación exitosa”.

#### Escenario 2: CA-05-A- Usuario duplicado

Dado que me encuentro en el formulario de creación de usuarios como Administrador Cuando ingreso un correo electrónico que ya se encuentra registrado en el sistema y confirmo

Entonces el sistema rechaza la operación e informa mediante una alerta que el usuario ya existe

Y evita la duplicidad de cuentas.

#### Escenario 3: CA-05-C- Validación obligatoria del rol del usuario Rol obligatorio

Dado que un Administrador está registrando un nuevo usuario en la plataforma

Cuando omite la selección del rol (dejándolo vacío) e intenta guardar la información Entonces el sistema interrumpe el proceso y solicita obligatoriamente la selección de un rol antes de permitir guardar.

## HU-007 Asignar un envío a una ruta o vehículo de transporte

Como operador logístico

Quiero asignar un envío registrado a una ruta y a un vehículo de transporte

Para saber quién lleva cada paquete y por qué recorrido, y así hacer un seguimiento más preciso de su movimiento.

### Descripción

El sistema debe permitir a un operador logístico buscar un envío que se encuentre en un estado válido (por ejemplo, "Pendiente de recolección" o "En centro de distribución") y asignarle una ruta de transporte preexistente y un vehículo/conductor. Esto vinculará la guía con el proceso de transporte físico.

### Acceptance Criteria

#### Escenario 1: CA-07-A - Asignación exitosa de ruta y vehículo

Dado que soy un operador logístico autenticado y el envío está en estado "Pendiente de recolección"

Cuando selecciono una ruta de transporte disponible, asigno un vehículo

Y presiono el botón "Asignar transporte"

Entonces el sistema asocia el envío a dicha ruta y vehículo

Y muestra el mensaje "Envío asignado a la ruta exitosamente".

#### Escenario 2: CA-07-B - Campos de asignación incompletos

Dado que estoy en el módulo de asignación de transporte para un envío

Cuando intento guardar la asignación dejando la ruta o el vehículo en blanco

Entonces el sistema resalta los campos vacíos en rojo

Y muestra una alerta indicando que "Debe seleccionar una ruta y un vehículo válidos" impidiendo la asignación.

#### Escenario 3: CA-07-C - Envío no disponible para asignación

Dado que busco un envío para asignarlo a un vehículo

Cuando el envío ya se encuentra en estado "Entregado" o "Devuelto"

Entonces el sistema deshabilita la opción de asignación de ruta

Y muestra un mensaje indicando que "El estado actual del envío no permite nuevas asignaciones".

## HU-013 Registrar un centro de distribución

Como administrador del sistema

Quiero registrar los centros de distribución con su nombre, ciudad y dirección

Para que los eventos logísticos y las rutas se asocien a puntos reales de la cadena y el historial de cada envío sea consistente.

### Descripción

El sistema debe proveer un módulo donde el administrador pueda crear, listar y gestionar los centros de distribución (bodegas o puntos de acopio). Estos centros serán la base para trazar rutas y registrar los puntos de paso en el historial de los paquetes.

### Acceptance Criteria

#### Escenario 1: CA-13-A - Registro exitoso de un centro de distribución

Dado que soy un administrador del sistema autenticado

Cuando ingreso correctamente el nombre del centro, la ciudad y la dirección completa

Y presiono "Guardar centro de distribución"

Entonces el sistema almacena el registro en la base de datos

Y muestra el mensaje "Centro de distribución registrado correctamente".

#### Escenario 2: CA-13-B - Centro de distribución duplicado

Dado que estoy registrando un nuevo centro de distribución

Cuando ingreso un nombre y dirección que ya se encuentran registrados en la misma ciudad

Entonces el sistema bloquea el registro

Y muestra una advertencia indicando "Ya existe un centro de distribución con estos datos en la ciudad seleccionada".

#### Escenario 3: CA-13-C - Validación de campos obligatorios

Dado que estoy en el formulario de creación del centro de distribución

Cuando omito llenar el campo de "Ciudad" o "Dirección"

Entonces el sistema interrumpe el almacenamiento

Y resalta los campos faltantes mostrando el mensaje "Este campo es obligatorio".

## HU-014 Registrar una ruta de transporte

Como administrador del sistema

Quiero registrar rutas de transporte definiendo su origen, destino y centros de distribución intermedios

Para poder asignar envíos a recorridos definidos y organizar mejor el movimiento de los paquetes.

### Descripción

El sistema permitirá al administrador configurar rutas fijas seleccionando centros de distribución previamente creados. Se debe indicar un punto de origen, un punto de destino y, de forma opcional, puntos de parada intermedios. No incluye ruteo algorítmico, es una configuración manual.

### Acceptance Criteria

#### Escenario 1: CA-14-A - Registro de ruta exitoso (origen y destino simples)

Dado que soy un administrador del sistema

Cuando asigno un nombre a la ruta, selecciono un centro de distribución de origen y un centro de destino diferentes

Y guardo los cambios

Entonces el sistema registra la nueva ruta de transporte

Y queda disponible para ser asignada a futuros envíos.

#### Escenario 2: CA-14-B - Inconsistencia de origen y destino

Dado que estoy configurando una nueva ruta de transporte

Cuando selecciono el mismo centro de distribución como origen y como destino

Entonces el sistema deshabilita el botón de guardado

Y muestra un error indicando "El origen y el destino no pueden ser el mismo centro de distribución".

#### Escenario 3: CA-14-C - Ruta con paradas intermedias

Dado que estoy configurando una ruta extensa

Cuando selecciono un origen, un destino, y agrego uno o más centros de distribución en la sección de "Paradas intermedias"

Entonces el sistema guarda la ruta respetando el orden secuencial de los puntos seleccionados.

## HU-015 Registrar la fecha estimada de entrega al crear el envío

Como operador logístico

Quiero registrar la fecha estimada de entrega al momento de crear el envío

Para que el cliente sepa cuándo debería llegar su paquete y se puedan identificar retrasos después.

### Descripción

Como parte del flujo de registro de un nuevo envío (complemento a la HU-001), el formulario debe contener un campo obligatorio donde el operador defina la fecha estimada en la que el paquete llegará a manos del destinatario. Esta fecha servirá como métrica para los reportes de retrasos.

### Acceptance Criteria

#### Escenario 1: CA-15-A - Asignación de fecha válida

Dado que estoy diligenciando el formulario de registro de un nuevo envío

Cuando ingreso en el campo "Fecha estimada de entrega" una fecha igual o posterior a la fecha actual del sistema

Entonces el sistema acepta el dato permitiendo continuar con la creación del envío.

#### Escenario 2: CA-15-B - Asignación de fecha en el pasado

Dado que me encuentro registrando un envío

Cuando selecciono una "Fecha estimada de entrega" que es anterior a la fecha actual

Entonces el sistema bloquea el campo

Y muestra una alerta indicando "La fecha estimada de entrega no puede estar en el pasado".

#### Escenario 3: CA-15-C - Visualización de la fecha para el cliente

Dado que un envío fue registrado exitosamente con una fecha estimada de entrega

Cuando el cliente consulta su número de guía en el portal (HU-002)

Entonces el sistema muestra de forma destacada la "Fecha estimada de entrega" configurada por el operador.
