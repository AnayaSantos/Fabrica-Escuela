import { apiRequest } from '@tracelog/api-client';
import type { IncidenciaRegistrada, NuevaIncidencia } from '../types';

export async function registrarIncidencia(
  numeroGuia: string,
  datos: NuevaIncidencia,
): Promise<IncidenciaRegistrada> {
  const guia = encodeURIComponent(numeroGuia.trim().toUpperCase());
  const cuerpo = new FormData();
  cuerpo.append('tipo', datos.tipo);
  cuerpo.append('descripcion', datos.descripcion.trim());
  if (datos.evidencia) cuerpo.append('evidencia', datos.evidencia);

  return apiRequest<IncidenciaRegistrada>(`/api/envios/${guia}/incidencias`, {
    method: 'POST',
    body: cuerpo,
  });
}
