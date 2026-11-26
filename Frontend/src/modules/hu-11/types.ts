export type EstadoEnvio =
  | 'Pendiente de recolección'
  | 'En tránsito'
  | 'En reparto'
  | 'Entregado'
  | 'Con incidencia'
  | 'Devuelto';

export interface EnvioListado {
  numeroGuia: string;
  estadoActual: EstadoEnvio;
  destino: string;
  fechaUltimaActualizacion: string;
}

export const ESTADOS_ENVIO: EstadoEnvio[] = [
  'Pendiente de recolección',
  'En tránsito',
  'En reparto',
  'Entregado',
  'Con incidencia',
  'Devuelto',
];
