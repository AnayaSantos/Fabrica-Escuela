import type { EstadoEnvio } from "../types";
import { normalizeEstadoEnvio } from "../utils/estadoEnvio";

interface StatusBadgeProps {
  estado: EstadoEnvio | string;
}

export function StatusBadge({ estado }: StatusBadgeProps) {
  const estadoNormalizado = normalizeEstadoEnvio(estado);

  if (!estadoNormalizado) {
    return <span className="status-badge">{estado}</span>;
  }

  return (
    <span className={`status-badge status-${statusClass(estadoNormalizado)}`}>
      {estadoNormalizado}
    </span>
  );
}

function statusClass(estado: EstadoEnvio) {
  const classes: Record<EstadoEnvio, string> = {
    "Pendiente de recolección": "pending",
    "En tránsito": "transit",
    "En reparto": "delivery",
    Entregado: "delivered",
    "Con incidencia": "incident",
    Devuelto: "returned",
  };

  return classes[estado];
}
