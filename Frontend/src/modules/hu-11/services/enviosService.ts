import { apiRequest } from '@tracelog/api-client';
import type { EnvioListado } from '../types';

/** Forma real que devuelve el backend (EnvioRecordResponse): no tiene un campo único
 * `destino`, sino `ciudadDestino`/`direccionDestino` por separado. */
interface EnvioRecordResponse {
  numeroGuia: string;
  ciudadDestino: string;
  estadoActual: string;
  fechaUltimaActualizacion: string;
}

export const enviosService = {
  async listar(): Promise<EnvioListado[]> {
    const registros = await apiRequest<EnvioRecordResponse[]>('/api/envios');
    return registros.map((registro) => ({
      numeroGuia: registro.numeroGuia,
      estadoActual: registro.estadoActual as EnvioListado['estadoActual'],
      destino: registro.ciudadDestino,
      fechaUltimaActualizacion: registro.fechaUltimaActualizacion,
    }));
  },
};
