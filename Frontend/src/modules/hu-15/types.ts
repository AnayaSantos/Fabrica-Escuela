/**
 * Tipos y contratos de datos para la gestión de centros de distribución
 */

export interface CentroDistribucion {
  id: string;
  codigo: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  estado: 'Activo' | 'Inactivo' | 'En Mantenimiento';
  fechaCreacion: string;
  paquetesEnTransito?: number;
  telefono?: string;
  capacidad?: string;
  notas?: string;
}

export interface CentroDistribucionInput {
  nombre: string;
  ciudad: string;
  direccion: string;
}

export interface FormularioErrores {
  nombre?: string;
  ciudad?: string;
  direccion?: string;
  general?: string;
}

export interface RespuestaServicio<T> {
  exito: boolean;
  codigoEstado: number; // 201 (Creado), 400 (Bad Request), 409 (Conflicto / Duplicado)
  mensaje: string;
  datos?: T;
  campoFaltante?: string;
}

export type VistaTab = 'registro' | 'listado' | 'red';
