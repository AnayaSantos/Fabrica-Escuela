export type RolUsuario = 'Administrador' | 'Operador Logístico' | 'Cliente';

export interface NuevoUsuarioPayload {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: RolUsuario | '';
}

export interface RespuestaCrearUsuario {
  mensaje: string;
  usuario?: {
    id?: string;
    nombre: string;
    correo: string;
    rol: RolUsuario;
  };
}

export type EstadoRegistro = 'IDLE' | 'EXITO' | 'ERROR';
