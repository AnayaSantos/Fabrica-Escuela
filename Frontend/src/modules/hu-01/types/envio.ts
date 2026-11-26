// ============================================================================
// TIPOS DEL DOMINIO "ENVÍO"
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
  tipoServicio: string;
  fechaEstimadaEntrega: string;
}

export interface EnvioResponse {
  numeroGuia: string;
}

// Los tres estados visuales del prototipo: HU01-Formulario, HU01-Errores, HU01-Exito.
export type VistaFormulario = "formulario" | "errores" | "exito";

export const CAMPOS_VACIOS: EnvioFormData = {
  nombreRemitente: "",
  documentoRemitente: "",
  telefonoRemitente: "",
  direccionOrigen: "",
  ciudadOrigen: "",
  nombreDestinatario: "",
  documentoDestinatario: "",
  telefonoDestinatario: "",
  direccionDestino: "",
  ciudadDestino: "",
  peso: "",
  tipoServicio: "",
  fechaEstimadaEntrega: "",
};

// Lista de campos obligatorios, usada para validar y para resaltar en rojo.
export const CAMPOS_OBLIGATORIOS: (keyof EnvioFormData)[] = Object.keys(
  CAMPOS_VACIOS
) as (keyof EnvioFormData)[];
