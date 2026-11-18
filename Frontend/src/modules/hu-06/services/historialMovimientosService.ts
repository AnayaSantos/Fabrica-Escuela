import { apiRequest } from '@tracelog/api-client';
import type { DatosGuia, EventoLogistico, HistorialConsulta } from '../types';

function rutaGuia(numeroGuia: string, sufijo = ''): string {
  const guia = encodeURIComponent(numeroGuia.trim().toUpperCase());
  return `/api/envios/${guia}${sufijo}`;
}

export function ordenarEventos(eventos: EventoLogistico[]): EventoLogistico[] {
  return [...eventos].sort((a, b) => a.timestamp - b.timestamp);
}

export async function consultarHistorial(numeroGuia: string): Promise<HistorialConsulta> {
  const [eventosResultado, resumenResultado] = await Promise.allSettled([
    apiRequest<EventoLogistico[]>(rutaGuia(numeroGuia, '/eventos')),
    apiRequest<DatosGuia>(rutaGuia(numeroGuia)),
  ]);

  if (eventosResultado.status === 'rejected') {
    throw eventosResultado.reason;
  }

  return {
    eventos: ordenarEventos(eventosResultado.value),
    resumen: resumenResultado.status === 'fulfilled' ? resumenResultado.value : null,
  };
}
