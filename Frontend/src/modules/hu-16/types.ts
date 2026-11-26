export const ESTADO_CON_INCIDENCIA = 'Con incidencia';

export const TIPOS_INCIDENCIA = [
  'Paquete dañado',
  'Dirección incorrecta',
  'Ausencia en domicilio',
  'Otro',
] as const;
export type TipoIncidencia = (typeof TIPOS_INCIDENCIA)[number];

/** Lo que el operador llena en el formulario. */
export interface NuevaIncidencia {
  tipo: TipoIncidencia;
  descripcion: string;
  evidencia?: File | null;
}

export interface IncidenciaRegistrada {
  id: string;
  fechaHora: string;
  timestamp: number;
  estado: string;
  ubicacion: string;
  detalle: string;
  tipoIncidencia: string;
  registradoPor?: string;
}
