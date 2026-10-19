import { apiRequest } from '@tracelog/api-client';
import type { EstadoEnvio, EnvioActualizable } from '../types';

const baseUrl = '/api/envios';

export function getEnvio(numeroGuia: string): Promise<EnvioActualizable> {
  const guia = encodeURIComponent(numeroGuia.trim().toUpperCase());
  return apiRequest<EnvioActualizable>(`${baseUrl}/${guia}`);
}

export function actualizarEstadoEnvio(
  numeroGuia: string,
  nuevoEstado: EstadoEnvio,
): Promise<EnvioActualizable> {
  const guia = encodeURIComponent(numeroGuia.trim().toUpperCase());
  return apiRequest<EnvioActualizable>(`${baseUrl}/${guia}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ nuevoEstado }),
  });
}
