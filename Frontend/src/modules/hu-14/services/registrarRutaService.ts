import { apiRequest } from '@tracelog/api-client';
import type { CentroDistribucion, RutaTransporte } from '../types/ruta';

export const registrarRutaService = {
  obtenerCentros(): Promise<CentroDistribucion[]> {
    return apiRequest<CentroDistribucion[]>('/api/centros-distribucion');
  },

  registrarRuta(ruta: RutaTransporte): Promise<void> {
    return apiRequest<void>('/api/rutas', {
      method: 'POST',
      body: JSON.stringify({
        nombre: ruta.nombreRuta,
        centroOrigenId: Number(ruta.origenId),
        centroDestinoId: Number(ruta.destinoId),
        paradasIntermediasIds: ruta.paradasIntermediasIds.map(Number),
      }),
    });
  },
};
