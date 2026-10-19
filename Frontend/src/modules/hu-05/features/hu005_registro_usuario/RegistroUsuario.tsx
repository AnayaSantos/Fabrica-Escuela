import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { RolUsuario, EstadoRegistro } from './types';
import { usuarioService, ErrorUsuario } from './usuarioService';

export const RegistroUsuario: React.FC = () => {
  const [nombre, setNombre] = useState('Pepito perez');
  const [correo, setCorreo] = useState('pepitoperez@gmail.com');
  const [contrasena, setContrasena] = useState('Pepito123@');
  const [rol, setRol] = useState<RolUsuario | ''>('Operador Logístico');
  
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [estadoRegistro, setEstadoRegistro] = useState<EstadoRegistro>('IDLE');
  
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [errorRol, setErrorRol] = useState<string | null>(null);

  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);
  const tieneSimbolo = /[@_,;.\-_!#$%&*+]/.test(contrasena);
  const tieneLongitud = contrasena.length > 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorCorreo(null);
    setErrorRol(null);
    setEstadoRegistro('IDLE');

    // Validación de campos obligatorios (Escenario 3: CA-05-C - Rol obligatorio)
    if (!rol) {
      setErrorRol('*¡Tienes que llenar todos los campos obligatorios!');
      setEstadoRegistro('ERROR');
      return;
    }

    if (!nombre.trim() || !correo.trim() || !contrasena) {
      if (!correo.trim()) {
        setErrorCorreo('*¡Tienes que llenar todos los campos obligatorios!');
      }
      setEstadoRegistro('ERROR');
      return;
    }

    setCargando(true);

    try {
      await usuarioService.registrarUsuario({
        nombre: nombre.trim(),
        correo: correo.trim(),
        contrasena,
        rol,
      });

      setEstadoRegistro('EXITO');
      setErrorCorreo(null);
      setErrorRol(null);
    } catch (err: unknown) {
      setEstadoRegistro('ERROR');
      if (err instanceof ErrorUsuario) {
        if (err.codigo === 'CORREO_DUPLICADO') {
          setErrorCorreo('*Este correo ya se encuentra registrado');
        } else if (err.codigo === 'CAMPOS_INCOMPLETOS') {
          setErrorRol('*¡Tienes que llenar todos los campos obligatorios!');
        }
      } else if (err instanceof Error) {
        if (err.message.includes('registrado') || err.message.includes('duplicado')) {
          setErrorCorreo('*Este correo ya se encuentra registrado');
        }
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div id="registro-usuario-container" className="flex flex-col items-center justify-center min-h-screen bg-white p-6 font-sans">
      {/* Título de la pantalla idéntico a Figma */}
      <h1 id="titulo-registro" className="text-4xl sm:text-5xl font-normal text-black mb-6 text-center tracking-tight">
        Registro de usuario
      </h1>

      {/* Tarjeta principal con fondo gris y borde negro redondeado */}
      <div id="card-registro" className="w-full max-w-[420px] bg-[#D9D9D9] border-2 border-black rounded-[28px] p-7 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Campo: Nombre:* */}
          <div className="flex flex-col">
            <label htmlFor="input-nombre" className="text-xl font-normal text-black mb-1">
              Nombre:*
            </label>
            <input
              id="input-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Pepito perez"
              className="w-full bg-white border-2 border-black rounded-full px-4 py-1.5 text-black text-base outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Campo: Correo electrónico:* */}
          <div className="flex flex-col">
            <label htmlFor="input-correo" className="text-xl font-normal text-black mb-1">
              Correo electrónico:*
            </label>
            <input
              id="input-correo"
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                if (errorCorreo) setErrorCorreo(null);
                if (estadoRegistro === 'ERROR') setEstadoRegistro('IDLE');
              }}
              placeholder="pepitoperez@gmail.com"
              className={`w-full bg-white border-2 rounded-full px-4 py-1.5 text-black text-base outline-none transition-colors ${
                errorCorreo
                  ? 'border-[#FF4D4D] focus:ring-1 focus:ring-[#FF4D4D]'
                  : 'border-black focus:ring-1 focus:ring-black'
              }`}
            />
            {errorCorreo && (
              <span id="error-correo" className="text-[#FF0000] text-xs sm:text-sm mt-1 font-normal">
                {errorCorreo}
              </span>
            )}
          </div>

          {/* Campo: Contraseña:* */}
          <div className="flex flex-col">
            <label htmlFor="input-contrasena" className="text-xl font-normal text-black mb-1">
              Contraseña:*
            </label>
            <div className="relative flex items-center w-full bg-white border-2 border-black rounded-full px-4 py-1.5">
              <input
                id="input-contrasena"
                type={mostrarPassword ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="**********"
                className="w-full bg-transparent text-black text-base outline-none pr-8"
              />
              <button
                type="button"
                id="btn-toggle-password"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3.5 text-black hover:opacity-70 transition cursor-pointer"
                title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarPassword ? (
                  <EyeOff className="w-5 h-5 stroke-[2]" />
                ) : (
                  <Eye className="w-5 h-5 stroke-[2]" />
                )}
              </button>
            </div>

            {/* Requisitos de contraseña especificados en Figma */}
            <div className="mt-1.5 pl-1 flex flex-col space-y-0.5">
              <p className="text-[11px] text-black font-normal">
                La contraseña debe contener:
              </p>
              <p className={`text-[11px] font-normal transition-colors ${tieneMayuscula ? 'text-[#16a34a]' : 'text-[#16a34a]'}`}>
                1 Letra mayúscula
              </p>
              <p className={`text-[11px] font-normal transition-colors ${tieneNumero ? 'text-[#16a34a]' : 'text-[#16a34a]'}`}>
                1 Número
              </p>
              <p className={`text-[11px] font-normal transition-colors ${tieneSimbolo ? 'text-[#16a34a]' : 'text-[#16a34a]'}`}>
                1 Símbolo especial (ejem.. @,_,;,,)
              </p>
              <p className={`text-[11px] font-normal transition-colors ${tieneLongitud ? 'text-[#16a34a]' : 'text-[#16a34a]'}`}>
                Debe contener más de 8 dígitos
              </p>
            </div>
          </div>

          {/* Campo: Rol:* */}
          <div className="flex flex-col">
            <label htmlFor="select-rol" className="text-xl font-normal text-black mb-1">
              Rol:*
            </label>
            <div
              className={`relative w-full bg-white border-2 rounded-full transition-colors ${
                errorRol
                  ? 'border-[#FF4D4D]'
                  : 'border-black'
              }`}
            >
              <select
                id="select-rol"
                value={rol}
                onChange={(e) => {
                  setRol(e.target.value as RolUsuario | '');
                  if (errorRol) setErrorRol(null);
                  if (estadoRegistro === 'ERROR') setEstadoRegistro('IDLE');
                }}
                className="w-full bg-transparent px-4 py-1.5 text-black text-base outline-none appearance-none cursor-pointer pr-10"
              >
                <option value="">Seleccione un rol...</option>
                <option value="Operador Logístico">Operador Logístico</option>
                <option value="Administrador">Administrador</option>
                <option value="Cliente">Cliente</option>
              </select>
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black text-xs">
                ▼
              </span>
            </div>
            {errorRol && (
              <span id="error-rol" className="text-[#FF0000] text-xs sm:text-sm mt-1 font-normal">
                {errorRol}
              </span>
            )}
          </div>

          {/* Estado de respuesta sobre el botón */}
          <div className="mt-3 flex flex-col items-center justify-center min-h-[32px]">
            {estadoRegistro === 'EXITO' && (
              <p id="mensaje-exito-crear" className="text-[#16a34a] text-lg font-normal text-center animate-fade-in">
                ¡Usuario creado exitosamente!
              </p>
            )}

            {estadoRegistro === 'ERROR' && (
              <p id="mensaje-error-crear" className="text-[#FF0000] text-lg font-normal text-center animate-fade-in">
                ¡Error al crear usuario!
              </p>
            )}
          </div>

          {/* Botón de acción idéntico a Figma */}
          <div className="flex justify-center">
            <button
              id="btn-registrar-usuario"
              type="submit"
              disabled={cargando}
              className="bg-[#9da5b4] hover:bg-[#8e96a5] active:scale-95 disabled:opacity-70 transition-all text-black text-lg font-normal py-1 px-8 rounded-full border-2 border-black shadow-sm cursor-pointer"
            >
              {cargando ? 'Registrando...' : 'Registrar Usuario'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegistroUsuario;
