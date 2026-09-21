import type {
  DatosGuia,
  EnvioFormData,
  EnvioRecord,
  EstadoEnvio,
  EventoLogistico,
} from "../types";
import * as localStore from "./shipmentStore";
import { normalizeEstadoEnvio } from "../utils/estadoEnvio";

type DataSource = "local" | "api";

const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE ?? "local") as DataSource;
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

function shouldUseApi() {
  return DATA_SOURCE === "api";
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function normalizeEnvioRecord(record: EnvioRecord): EnvioRecord {
  return {
    ...record,
    estadoActual: normalizeEstadoEnvio(record.estadoActual) ?? record.estadoActual,
    eventos: record.eventos ?? [],
  };
}

function normalizeDatosGuia(datos: DatosGuia): DatosGuia {
  return {
    ...datos,
    estadoActual: normalizeEstadoEnvio(datos.estadoActual) ?? datos.estadoActual,
    eventos: datos.eventos ?? [],
  };
}

export async function initializeStore() {
  if (!shouldUseApi()) {
    localStore.initializeStore();
  }
}

export async function listEnvios() {
  if (!shouldUseApi()) {
    return localStore.listEnvios();
  }

  const envios = await apiRequest<EnvioRecord[]>("/api/envios");
  return envios.map(normalizeEnvioRecord);
}

export async function registrarEnvio(datos: EnvioFormData) {
  if (!shouldUseApi()) {
    return localStore.registrarEnvio(datos);
  }

  return apiRequest<{ numeroGuia: string }>("/api/envios", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export async function consultarGuia(numeroGuia: string): Promise<DatosGuia> {
  if (!shouldUseApi()) {
    return localStore.consultarGuia(numeroGuia);
  }

  const datos = await apiRequest<DatosGuia>(`/api/envios/${encodeURIComponent(numeroGuia)}`);
  return normalizeDatosGuia(datos);
}

export async function actualizarEstadoEnvio(numeroGuia: string, nuevoEstado: EstadoEnvio) {
  if (!shouldUseApi()) {
    return localStore.actualizarEstadoEnvio(numeroGuia, nuevoEstado);
  }

  const updated = await apiRequest<EnvioRecord>(`/api/envios/${encodeURIComponent(numeroGuia)}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ nuevoEstado }),
  });
  return normalizeEnvioRecord(updated);
}

export async function registrarEventoLogistico(
  numeroGuia: string,
  evento: Pick<EventoLogistico, "estado" | "ubicacion" | "detalle">,
) {
  if (!shouldUseApi()) {
    return localStore.registrarEventoLogistico(numeroGuia, evento);
  }

  const updated = await apiRequest<EnvioRecord>(`/api/envios/${encodeURIComponent(numeroGuia)}/eventos`, {
    method: "POST",
    body: JSON.stringify(evento),
  });
  return normalizeEnvioRecord(updated);
}

export async function eliminarEventoLogistico(numeroGuia: string, eventoId: string) {
  if (!shouldUseApi()) {
    return localStore.eliminarEventoLogistico(numeroGuia, eventoId);
  }

  const updated = await apiRequest<EnvioRecord>(
    `/api/envios/${encodeURIComponent(numeroGuia)}/eventos/${encodeURIComponent(eventoId)}`,
    { method: "DELETE" },
  );
  return normalizeEnvioRecord(updated);
}
