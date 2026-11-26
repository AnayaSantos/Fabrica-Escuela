import type { NuevoUsuarioPayload, RespuestaCrearUsuario } from './types';
import { ApiError, apiRequest } from '@tracelog/api-client';

export interface IUsuarioService {
  registrarUsuario(datos: NuevoUsuarioPayload): Promise<RespuestaCrearUsuario>;
}

export class ErrorUsuario extends Error {
  codigo?: 'CORREO_DUPLICADO' | 'CAMPOS_INCOMPLETOS' | 'ERROR_SERVIDOR';
  constructor(mensaje: string, codigo?: 'CORREO_DUPLICADO' | 'CAMPOS_INCOMPLETOS' | 'ERROR_SERVIDOR') {
    super(mensaje);
    this.name = 'ErrorUsuario';
    this.codigo = codigo;
  }
}

/**
 * Servicio de usuarios (Capa de Servicios del Frontend - HU-005)
 * Desacopla completamente la interfaz de usuario de la lógica de red y del backend.
 * Realiza peticiones HTTP al endpoint REST provisto por el backend (POST /api/usuarios).
 */
class UsuarioService implements IUsuarioService {
  private readonly baseUrl = '/api/usuarios';

  async registrarUsuario(datos: NuevoUsuarioPayload): Promise<RespuestaCrearUsuario> {
    try {
      return await apiRequest<RespuestaCrearUsuario>(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify({
          nombre: datos.nombre,
          correo: datos.correo,
          password: datos.contrasena,
          rol: datos.rol,
        }),
      });
    } catch (err: unknown) {
      if (err instanceof ErrorUsuario) {
        throw err;
      }
      if (err instanceof ApiError && err.status === 409) {
        throw new ErrorUsuario('*Este correo ya se encuentra registrado', 'CORREO_DUPLICADO');
      }
      if (err instanceof ApiError && err.status === 400) {
        throw new ErrorUsuario('*¡Tienes que llenar todos los campos obligatorios!', 'CAMPOS_INCOMPLETOS');
      }
      throw new ErrorUsuario(
        err instanceof Error ? err.message : '¡Error al crear usuario!',
        'ERROR_SERVIDOR',
      );
    }
  }
}

export const usuarioService = new UsuarioService();
