import type { EstadoEnvio } from "../types";

export const ESTADOS_ENVIO: EstadoEnvio[] = [
  "Pendiente de recolección",
  "En tránsito",
  "En reparto",
  "Entregado",
  "Con incidencia",
  "Devuelto",
];

export const TRANSICIONES_VALIDAS: Record<EstadoEnvio, EstadoEnvio[]> = {
  "Pendiente de recolección": ["En tránsito", "Con incidencia"],
  "En tránsito": ["En reparto", "Con incidencia", "Devuelto"],
  "En reparto": ["Entregado", "Con incidencia", "Devuelto"],
  Entregado: [],
  "Con incidencia": ["En tránsito", "En reparto", "Devuelto"],
  Devuelto: [],
};

export function normalizeEstadoEnvio(value: string | null | undefined): EstadoEnvio | null {
  const normalized = normalizeText(value ?? "");
  return ESTADOS_ENVIO.find((estado) => normalizeText(estado) === normalized) ?? null;
}

export function getTransicionesPermitidas(value: string | null | undefined): EstadoEnvio[] {
  const estado = normalizeEstadoEnvio(value);
  return estado ? TRANSICIONES_VALIDAS[estado] : [];
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .trim()
    .toUpperCase();
}
