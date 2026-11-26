import type { DatosGuia } from './types';
import { ApiError, apiRequest } from '@tracelog/api-client';

export interface IEnvioService {
  consultarGuia(numeroGuia: string): Promise<DatosGuia>;
}

/**
 * Servicio de envíos (Capa de Servicios del Frontend - HU-002)
 * Desacopla completamente la interfaz de usuario de la lógica de red y del backend.
 * Realiza peticiones HTTP al endpoint REST provisto por el backend (GET /api/envios/:numeroGuia).
 */
class EnvioService implements IEnvioService {
  private readonly baseUrl = '/api/envios';

  async consultarGuia(numeroGuia: string): Promise<DatosGuia> {
    const codigoLimpio = encodeURIComponent(numeroGuia.trim().toUpperCase());
    try {
      return await apiRequest<DatosGuia>(`${this.baseUrl}/${codigoLimpio}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw new Error('Número de guía inexistente.', { cause: error });
      }
      throw error;
    }
  }
}

export const envioService = new EnvioService();
