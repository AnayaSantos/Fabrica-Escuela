import { apiRequest, setToken, getToken } from './index';

export type RolNormalizado = 'administrador' | 'operador' | 'cliente';

interface LoginResponse {
  token: string;
  tipoToken: string;
  expiraEnSegundos: number;
  nombre: string;
  rol: string;
}

export interface SesionActiva {
  nombre: string;
  rol: RolNormalizado;
}

const NOMBRE_STORAGE_KEY = 'tracelog_nombre';
const ROL_STORAGE_KEY = 'tracelog_rol';

function normalizarRol(rolEtiqueta: string): RolNormalizado {
  const normalizado = rolEtiqueta.trim().toLowerCase();
  if (normalizado.startsWith('admin')) return 'administrador';
  if (normalizado.startsWith('operador')) return 'operador';
  return 'cliente';
}

export async function iniciarSesion(correo: string, password: string): Promise<SesionActiva> {
  const respuesta = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });

  const sesion: SesionActiva = {
    nombre: respuesta.nombre,
    rol: normalizarRol(respuesta.rol),
  };

  setToken(respuesta.token);
  localStorage.setItem(NOMBRE_STORAGE_KEY, sesion.nombre);
  localStorage.setItem(ROL_STORAGE_KEY, sesion.rol);

  return sesion;
}

export function cerrarSesion(): void {
  setToken(null);
  localStorage.removeItem(NOMBRE_STORAGE_KEY);
  localStorage.removeItem(ROL_STORAGE_KEY);
}

export function obtenerSesion(): SesionActiva | null {
  const token = getToken();
  const nombre = localStorage.getItem(NOMBRE_STORAGE_KEY);
  const rol = localStorage.getItem(ROL_STORAGE_KEY) as RolNormalizado | null;

  if (!token || !nombre || !rol) {
    return null;
  }

  return { nombre, rol };
}
