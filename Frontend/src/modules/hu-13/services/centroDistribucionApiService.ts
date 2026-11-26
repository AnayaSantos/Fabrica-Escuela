import { ApiError, apiRequest } from '@tracelog/api-client';
import type {
  CentroDistribucion,
  CentroDistribucionInput,
  RespuestaServicio,
} from '../types';

// Forma real que devuelve el backend (CentroDistribucionResponse): no incluye
// codigo/estado/fechaCreacion/paquetesEnTransito/telefono/capacidad/notas, que
// son campos solo de presentacion en este modulo.
interface CentroDistribucionBackend {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string;
}

function aCentroDistribucion(backend: CentroDistribucionBackend): CentroDistribucion {
  return {
    id: String(backend.id),
    codigo: `CD-${String(backend.id).padStart(4, '0')}`,
    nombre: backend.nombre,
    ciudad: backend.ciudad,
    direccion: backend.direccion,
    estado: 'Activo',
    fechaCreacion: '',
    paquetesEnTransito: 0,
  };
}

export const CIUDADES_COLOMBIA: string[] = [
  'Medellín',
  'Bogotá',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
  'Manizales',
  'Santa Marta',
  'Cúcuta',
  'Ibagué',
  'Pasto',
  'Villavicencio',
  'Armenia',
  'Montería',
  'Valledupar',
  'Neiva',
  'Popayán',
  'Sincelejo',
  'Tunja',
];

const baseUrl = '/api/centros-distribucion';

export const centroDistribucionService = {
  async obtenerCentros(): Promise<CentroDistribucion[]> {
    const centros = await apiRequest<CentroDistribucionBackend[]>(baseUrl);
    return centros.map(aCentroDistribucion);
  },

  async registrarCentro(input: CentroDistribucionInput): Promise<RespuestaServicio<CentroDistribucion>> {
    try {
      const creado = await apiRequest<CentroDistribucionBackend>(baseUrl, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return {
        exito: true,
        codigoEstado: 201,
        mensaje: 'Centro de distribución registrado correctamente.',
        datos: aCentroDistribucion(creado),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          exito: false,
          codigoEstado: error.status,
          mensaje: error.message,
        };
      }
      throw error;
    }
  },

  eliminarCentro(id: string): Promise<void> {
    return apiRequest<void>(`${baseUrl}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
