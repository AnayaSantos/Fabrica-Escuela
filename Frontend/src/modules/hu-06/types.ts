import type { EstadoAlertaTiempo } from '@tracelog/hu-19';

export interface EventoLogistico {
  id: string;
  fechaHora: string;
  timestamp: number;
  estado: string;
  ubicacion: string;
  detalle: string;
}

export interface DatosGuia {
  numeroGuia: string;
  fechaEstimadaEntrega?: string | null;
  alertaTiempo?: EstadoAlertaTiempo | null;
}

export interface HistorialConsulta {
  eventos: EventoLogistico[];
  resumen: DatosGuia | null;
}

export type EstadoConsulta = 'IDLE' | 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR';
