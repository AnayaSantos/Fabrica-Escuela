import type {
  DatosGuia,
  EnvioFormData,
  EnvioRecord,
  EstadoEnvio,
  EventoConsulta,
  EventoLogistico,
  TipoEventoLogistico,
} from "../types";

const STORAGE_KEY = "hu_envios_integrados";
const COUNTER_KEY = "hu_envios_integrados_counter";
const DEMO_GUIDE = "LG-2026-00000001";

type StoredDatabase = Record<string, EnvioRecord>;

const ESTADO_DESDE_EVENTO: Partial<Record<TipoEventoLogistico, EstadoEnvio>> = {
  CREADO: "Pendiente de recolección",
  PREPARANDO: "Pendiente de recolección",
  "EN BODEGA": "Pendiente de recolección",
  "EN TRÁNSITO": "En tránsito",
  ENTREGADO: "Entregado",
};

const seedDatabase: StoredDatabase = {
  [DEMO_GUIDE]: {
    numeroGuia: DEMO_GUIDE,
    nombreRemitente: "Laura Gómez",
    documentoRemitente: "1020456789",
    telefonoRemitente: "3005550190",
    direccionOrigen: "Calle 72 #10-34",
    ciudadOrigen: "Bogotá",
    nombreDestinatario: "Carlos Pérez",
    documentoDestinatario: "80123456",
    telefonoDestinatario: "3105550144",
    direccionDestino: "Carrera 43A #7-50",
    ciudadDestino: "Medellín",
    peso: "2.5",
    tipoServicio: "EXPRESS",
    fechaEstimadaEntrega: "2026-09-24",
    estadoActual: "En reparto",
    fechaRegistro: "03/09/2026 09:00:00",
    fechaUltimaActualizacion: "04/09/2026 08:30:00",
    eventos: [
      {
        id: "evento-demo-3",
        timestamp: new Date(2026, 8, 4, 8, 30).getTime(),
        fechaHora: "04/09/2026 08:30:00",
        estado: "En reparto",
        ubicacion: "C.A. Medellín",
        detalle: "En ruta de entrega",
      },
      {
        id: "evento-demo-2",
        timestamp: new Date(2026, 8, 3, 14, 15).getTime(),
        fechaHora: "03/09/2026 14:15:00",
        estado: "EN BODEGA",
        ubicacion: "Bodega Bogotá",
        detalle: "Clasificado para ciudad destino",
      },
      {
        id: "evento-demo-1",
        timestamp: new Date(2026, 8, 3, 9, 0).getTime(),
        fechaHora: "03/09/2026 09:00:00",
        estado: "CREADO",
        ubicacion: "P.A. Bogotá",
        detalle: "Registrado",
      },
    ],
  },
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function cloneSeed(): StoredDatabase {
  return JSON.parse(JSON.stringify(seedDatabase)) as StoredDatabase;
}

function writeDatabase(database: StoredDatabase) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function readDatabase(): StoredDatabase {
  if (!isBrowser()) {
    return cloneSeed();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seeded = cloneSeed();
    writeDatabase(seeded);
    return seeded;
  }

  try {
    return JSON.parse(stored) as StoredDatabase;
  } catch {
    const seeded = cloneSeed();
    writeDatabase(seeded);
    return seeded;
  }
}

function wait(ms = 220) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function initializeStore() {
  readDatabase();
}

export function formatFechaHora(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  const segundos = String(fecha.getSeconds()).padStart(2, "0");
  return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
}

function formatFechaInput(value: string) {
  if (!value) {
    return "Sin fecha estimada";
  }

  const [anio, mes, dia] = value.split("-");
  return `${dia}/${mes}/${anio}`;
}

function nextGuide(database: StoredDatabase) {
  const year = new Date().getFullYear();
  const storedCounter = isBrowser() ? window.localStorage.getItem(COUNTER_KEY) : null;
  let counter = storedCounter ? Number(storedCounter) : Object.keys(database).length + 1;

  while (Number.isNaN(counter) || counter < 1) {
    counter = Object.keys(database).length + 1;
  }

  let guide = `LG-${year}-${String(counter).padStart(8, "0")}`;
  while (database[guide]) {
    counter += 1;
    guide = `LG-${year}-${String(counter).padStart(8, "0")}`;
  }

  if (isBrowser()) {
    window.localStorage.setItem(COUNTER_KEY, String(counter + 1));
  }

  return guide;
}

function buildTimeline(record: EnvioRecord): EventoConsulta[] {
  const completedEvents = record.eventos
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((evento) => ({
      titulo: evento.estado,
      fechaHora: evento.fechaHora,
      completado: true,
    }));

  if (record.estadoActual !== "Entregado" && record.estadoActual !== "Devuelto") {
    completedEvents.push({
      titulo: "Entrega estimada",
      fechaHora: formatFechaInput(record.fechaEstimadaEntrega),
      completado: false,
    });
  }

  return completedEvents;
}

function normalizeGuide(numeroGuia: string) {
  return numeroGuia.trim().toUpperCase();
}

export function listEnvios() {
  return Object.values(readDatabase()).sort((a, b) =>
    a.numeroGuia.localeCompare(b.numeroGuia),
  );
}

export function getEnvio(numeroGuia: string) {
  const database = readDatabase();
  return database[normalizeGuide(numeroGuia)] ?? null;
}

export async function registrarEnvio(datos: EnvioFormData) {
  await wait();

  const database = readDatabase();
  const numeroGuia = nextGuide(database);
  const ahora = new Date();
  const fechaActual = formatFechaHora(ahora);

  const record: EnvioRecord = {
    ...datos,
    numeroGuia,
    estadoActual: "Pendiente de recolección",
    fechaRegistro: fechaActual,
    fechaUltimaActualizacion: fechaActual,
    eventos: [
      {
        id: `evento-${ahora.getTime()}`,
        timestamp: ahora.getTime(),
        fechaHora: fechaActual,
        estado: "CREADO",
        ubicacion: datos.ciudadOrigen,
        detalle: "Envío registrado",
      },
    ],
  };

  database[numeroGuia] = record;
  writeDatabase(database);

  return { numeroGuia };
}

export async function consultarGuia(numeroGuia: string): Promise<DatosGuia> {
  await wait(180);

  const record = getEnvio(numeroGuia);
  if (!record) {
    throw new Error("Número de guía inexistente.");
  }

  return {
    numeroGuia: record.numeroGuia,
    estadoActual: record.estadoActual,
    remitente: record.nombreRemitente,
    destinatario: record.nombreDestinatario,
    origen: record.ciudadOrigen,
    destino: record.ciudadDestino,
    eventos: buildTimeline(record),
  };
}

export function actualizarEstadoEnvio(numeroGuia: string, nuevoEstado: EstadoEnvio) {
  const database = readDatabase();
  const guia = normalizeGuide(numeroGuia);
  const envio = database[guia];

  if (!envio) {
    return null;
  }

  const ahora = new Date();
  const fechaActual = formatFechaHora(ahora);
  const nuevoEvento: EventoLogistico = {
    id: `evento-${ahora.getTime()}`,
    timestamp: ahora.getTime(),
    fechaHora: fechaActual,
    estado: nuevoEstado,
    ubicacion: envio.ciudadDestino,
    detalle: "Estado actualizado desde HU-03",
  };

  database[guia] = {
    ...envio,
    estadoActual: nuevoEstado,
    fechaUltimaActualizacion: fechaActual,
    eventos: [nuevoEvento, ...envio.eventos],
  };

  writeDatabase(database);
  return database[guia];
}

export function registrarEventoLogistico(
  numeroGuia: string,
  evento: Pick<EventoLogistico, "estado" | "ubicacion" | "detalle">,
) {
  const database = readDatabase();
  const guia = normalizeGuide(numeroGuia);
  const envio = database[guia];

  if (!envio) {
    return null;
  }

  const ahora = new Date();
  const fechaActual = formatFechaHora(ahora);
  const estadoActual = ESTADO_DESDE_EVENTO[evento.estado as TipoEventoLogistico] ?? envio.estadoActual;
  const nuevoEvento: EventoLogistico = {
    id: `evento-${ahora.getTime()}`,
    timestamp: ahora.getTime(),
    fechaHora: fechaActual,
    estado: evento.estado,
    ubicacion: evento.ubicacion,
    detalle: evento.detalle || "Novedad atendida",
  };

  database[guia] = {
    ...envio,
    estadoActual,
    fechaUltimaActualizacion: fechaActual,
    eventos: [nuevoEvento, ...envio.eventos].sort((a, b) => b.timestamp - a.timestamp),
  };

  writeDatabase(database);
  return database[guia];
}

export function eliminarEventoLogistico(numeroGuia: string, eventoId: string) {
  const database = readDatabase();
  const guia = normalizeGuide(numeroGuia);
  const envio = database[guia];

  if (!envio) {
    return null;
  }

  database[guia] = {
    ...envio,
    eventos: envio.eventos.filter((evento) => evento.id !== eventoId),
  };

  writeDatabase(database);
  return database[guia];
}
