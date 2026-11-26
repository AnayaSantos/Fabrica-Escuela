export interface Evento {
  titulo: string;
  fechaHora: string;
  completado: boolean;
}

export interface DatosGuia {
  numeroGuia: string;
  eventos: Evento[];
}

export type EstadoEnvio =
  | 'Pendiente de recolección'
  | 'En tránsito'
  | 'En reparto'
  | 'Entregado'
  | 'Con incidencia'
  | 'Devuelto';

export interface EnvioActualizable {
  numeroGuia: string;
  estadoActual: EstadoEnvio;
  fechaUltimaActualizacion: string;
}

export type EstadoActualizacionEnvio = 'IDLE' | 'EXITO' | 'ERROR';