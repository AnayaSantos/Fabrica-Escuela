import { apiRequest } from '@tracelog/api-client';

export type EstadoEnvio = 'Pendiente de recolección' | 'Entregado' | 'Devuelto';

export interface EnvioAsignable {
  numeroGuia: string;
  estadoActual: EstadoEnvio;
}

export interface RutaTransporte {
  id: string;
  nombre: string;
  centroOrigenNombre: string;
  centroDestinoNombre: string;
}

export interface VehiculoDisponible {
  id: string;
  conductor: string;
  placa: string;
}

export interface AsignacionTransporteInput {
  rutaId: string;
  vehiculoId: string;
}

interface VehiculoResponse {
  id: number;
  placa: string;
  conductor: string;
  tipo: string;
  activo: boolean;
}

export const asignacionTransporteService = {
  consultarEnvio(numeroGuia: string): Promise<EnvioAsignable> {
    const guia = encodeURIComponent(numeroGuia.trim().toUpperCase());
    return apiRequest<EnvioAsignable>(`/api/envios/${guia}`);
  },

  obtenerRutas(): Promise<RutaTransporte[]> {
    return apiRequest<RutaTransporte[]>('/api/rutas');
  },

  async obtenerVehiculosDisponibles(): Promise<VehiculoDisponible[]> {
    const vehiculos = await apiRequest<VehiculoResponse[]>('/api/vehiculos');
    return vehiculos
      .filter((vehiculo) => vehiculo.activo)
      .map((vehiculo) => ({
        id: String(vehiculo.id),
        conductor: vehiculo.conductor,
        placa: vehiculo.placa,
      }));
  },

  asignar(numeroGuia: string, asignacion: AsignacionTransporteInput): Promise<void> {
    const guia = encodeURIComponent(numeroGuia.trim().toUpperCase());
    return apiRequest<void>(`/api/envios/${guia}/asignacion-transporte`, {
      method: 'POST',
      body: JSON.stringify({
        rutaId: Number(asignacion.rutaId),
        vehiculoId: Number(asignacion.vehiculoId),
      }),
    });
  },
};
