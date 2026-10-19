import type { EstadoAlertaTiempo } from '@tracelog/hu-19';

export interface Evento {
  titulo: string;
  fechaHora: string;
  completado: boolean;
}

export interface DatosGuia {
  numeroGuia: string;
  eventos: Evento[];
  alertaTiempo?: EstadoAlertaTiempo | null;
  fechaEstimadaEntrega?: string | null;
}

export type EstadoConsulta = 'IDLE' | 'EXITO' | 'ERROR';
