export type FeatureId = "registro" | "consulta" | "actualizacion" | "historial";

export type TipoServicio = "ESTANDAR" | "EXPRESS";

export type EstadoEnvio =
  | "Pendiente de recolección"
  | "En tránsito"
  | "En reparto"
  | "Entregado"
  | "Con incidencia"
  | "Devuelto";

export interface EnvioFormData {
  nombreRemitente: string;
  documentoRemitente: string;
  telefonoRemitente: string;
  direccionOrigen: string;
  ciudadOrigen: string;
  nombreDestinatario: string;
  documentoDestinatario: string;
  telefonoDestinatario: string;
  direccionDestino: string;
  ciudadDestino: string;
  peso: string;
  tipoServicio: TipoServicio | "";
  fechaEstimadaEntrega: string;
}

export interface EventoLogistico {
  id: string;
  timestamp: number;
  fechaHora: string;
  estado: string;
  ubicacion: string;
  detalle: string;
}

export interface EnvioRecord extends EnvioFormData {
  numeroGuia: string;
  estadoActual: EstadoEnvio;
  fechaRegistro: string;
  fechaUltimaActualizacion: string;
  eventos: EventoLogistico[];
}

export interface EventoConsulta {
  titulo: string;
  fechaHora: string;
  completado: boolean;
}

export interface DatosGuia {
  numeroGuia: string;
  estadoActual: EstadoEnvio;
  remitente: string;
  destinatario: string;
  origen: string;
  destino: string;
  eventos: EventoConsulta[];
}

export type EstadoConsulta = "IDLE" | "EXITO" | "ERROR";

export type TipoEventoLogistico =
  | "CREADO"
  | "PREPARANDO"
  | "EN BODEGA"
  | "EN TRÁNSITO"
  | "ENTREGADO";
