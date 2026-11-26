import { apiRequest } from '@tracelog/api-client';
import type { EventoLogistico } from '../types';

export interface NuevoEventoLogistico {
  estado: string;
  ubicacion: string;
  detalle: string;
}

// Rutas frontend propuestas; confirmar el contrato con Spring antes de conectar un backend.
export const historialEventosService = {
  obtenerEventos(numeroGuia: string): Promise<EventoLogistico[]> {
    const guia = encodeURIComponent(numeroGuia.trim().toUpperCase());
    return apiRequest<EventoLogistico[]>(`/api/envios/${guia}/eventos`);
  },

  registrarEvento(numeroGuia: string, evento: NuevoEventoLogistico): Promise<EventoLogistico> {
    const guia = encodeURIComponent(numeroGuia.trim().toUpperCase());
    return apiRequest<EventoLogistico>(`/api/envios/${guia}/eventos`, {
      method: 'POST',
      body: JSON.stringify(evento),
    });
  },

  eliminarEvento(numeroGuia: string, eventoId: string): Promise<void> {
    const guia = encodeURIComponent(numeroGuia.trim().toUpperCase());
    const id = encodeURIComponent(eventoId);
    return apiRequest<void>(`/api/envios/${guia}/eventos/${id}`, {
      method: 'DELETE',
    });
  },
};
