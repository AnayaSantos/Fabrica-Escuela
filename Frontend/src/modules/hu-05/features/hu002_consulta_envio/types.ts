export interface Evento {
  titulo: string;
  fechaHora: string;
  completado: boolean;
}

export interface DatosGuia {
  numeroGuia: string;
  eventos: Evento[];
}

export type EstadoConsulta = 'IDLE' | 'EXITO' | 'ERROR';
