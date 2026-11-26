// src/components/HistorialEventos.tsx
import React, { useState } from 'react';
import type { EventoLogistico } from '../types';
import { historialEventosService } from '../services/historialEventosService';

const TIPOS_EVENTO = [
  'CREADO',
  'PREPARANDO',
  'EN BODEGA',
  'EN TRÁNSITO',
  'ENTREGADO',
] as const;

const ubicacionValida = (ubicacion: string) => /[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]/.test(ubicacion.trim());

export const HistorialEventos: React.FC = () => {
  const [eventos, setEventos] = useState<EventoLogistico[]>([]);
  const [numeroGuia, setNumeroGuia] = useState('');
  const [guiaConsultada, setGuiaConsultada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorServicio, setErrorServicio] = useState('');

  // Controladores de vistas
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  // Variables del formulario
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');
  const [nuevoDetalle, setNuevoDetalle] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');

  // Lógica para guardar un nuevo evento
  const handleConsultarHistorial = async (e: React.FormEvent) => {
    e.preventDefault();
    const guia = numeroGuia.trim();
    if (!guia) return;

    setCargando(true);
    setErrorServicio('');
    setEventos([]);
    try {
      const resultado = await historialEventosService.obtenerEventos(guia);
      setEventos(resultado);
      setGuiaConsultada(guia);
    } catch (error: unknown) {
      setGuiaConsultada('');
      setErrorServicio(error instanceof Error ? error.message : 'No se pudo consultar la bitácora.');
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!TIPOS_EVENTO.includes(nuevoEstado as typeof TIPOS_EVENTO[number])) {
      setErrorFormulario('El evento no es válido y no puede registrarse.');
      return;
    }

    if (!ubicacionValida(nuevaUbicacion)) {
      setErrorFormulario('El evento no es válido y no puede registrarse. Ingrese una ubicación válida.');
      return;
    }
    if (!guiaConsultada) {
      setErrorFormulario('Consulta una guía antes de registrar un evento.');
      return;
    }

    setGuardando(true);
    setErrorServicio('');
    try {
      const nuevoEvento = await historialEventosService.registrarEvento(guiaConsultada, {
        estado: nuevoEstado,
        ubicacion: nuevaUbicacion.trim(),
        detalle: nuevoDetalle.trim(),
      });
      setEventos((actuales) => [nuevoEvento, ...actuales].sort((a, b) => b.timestamp - a.timestamp));
      setNuevoEstado('');
      setNuevaUbicacion('');
      setNuevoDetalle('');
      setErrorFormulario('');
      setMostrarFormulario(false);
      setMostrarExito(true);
      setTimeout(() => setMostrarExito(false), 4000);
    } catch (error: unknown) {
      setErrorServicio(error instanceof Error ? error.message : 'No se pudo registrar el evento.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarEvento = async (id: string) => {
    if (!guiaConsultada) return;
    setErrorServicio('');
    try {
      await historialEventosService.eliminarEvento(guiaConsultada, id);
      setEventos((actuales) => actuales.filter((evento) => evento.id !== id));
    } catch (error: unknown) {
      setErrorServicio(error instanceof Error ? error.message : 'No se pudo eliminar el evento.');
    }
  };

  const handleMostrarFormulario = () => {
    setErrorFormulario('');
    setMostrarExito(false);
    setMostrarFormulario(true);
  };

  const handleCancelarFormulario = () => {
    setErrorFormulario('');
    setMostrarFormulario(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-800 p-8 font-sans">
      <div className="bg-white w-full max-w-4xl p-8 shadow-lg">
        
        {/* Cabecera */}
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-gray-800 font-medium">Bitácora de Eventos - Guía</h2>
            <p className="text-gray-600">{guiaConsultada || 'Consulta una guía para ver su historial'}</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <form onSubmit={handleConsultarHistorial} className="flex items-end gap-2">
              <label className="text-xs text-gray-700">
                Número de guía
                <input
                  value={numeroGuia}
                  onChange={(e) => setNumeroGuia(e.target.value)}
                  className="mt-1 block rounded border border-gray-400 px-3 py-2 text-sm"
                  placeholder="Ingrese una guía"
                  required
                />
              </label>
              <button type="submit" disabled={cargando} className="rounded bg-slate-700 px-4 py-2 text-sm text-white disabled:opacity-60">
                {cargando ? 'Consultando...' : 'Consultar'}
              </button>
            </form>
            {!mostrarFormulario && guiaConsultada && (
            <button 
              onClick={handleMostrarFormulario}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm cursor-pointer"
            >
              + Registrar Evento
            </button>
            )}
          </div>
        </div>

        {errorServicio && <p role="alert" className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-800">{errorServicio}</p>}

        {/* Mensaje de Éxito */}
        {mostrarExito && !mostrarFormulario && (
          <div className="bg-green-100 text-green-800 px-4 py-2 mb-6 text-sm">
            Evento registrado con éxito en la bitácora del envío {guiaConsultada}.
          </div>
        )}

        {/* Vistas condicionales */}
        {mostrarFormulario ? (
          <div className="w-full max-w-md mt-4">
            <h3 className="text-blue-600 underline mb-6 text-sm">Registrar Nuevo Evento Logístico</h3>
            
            <form onSubmit={handleGuardarEvento} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Estado *</label>
                <select 
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full bg-gray-200 border-none p-2 text-sm outline-none"
                  required
                >
                  <option value="">[ Seleccionar estado... ]</option>
                  <option value="CREADO">CREADO</option>
                  <option value="PREPARANDO">PREPARANDO</option>
                  <option value="EN BODEGA">EN BODEGA</option>
                  <option value="EN TRÁNSITO">EN TRÁNSITO</option>
                  <option value="ENTREGADO">ENTREGADO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Ubicación *</label>
                <input 
                  type="text" 
                  value={nuevaUbicacion}
                  onChange={(e) => setNuevaUbicacion(e.target.value)}
                  placeholder="[ Ej. Centro de Acopio Medellín ]" 
                  minLength={3}
                  className="w-full bg-gray-200 border-none p-2 text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Observaciones / Novedad</label>
                <input 
                  type="text" 
                  value={nuevoDetalle}
                  onChange={(e) => setNuevoDetalle(e.target.value)}
                  placeholder="Ingrese detalles o novedades del envío..." 
                  className="w-full bg-gray-200 border-none p-2 text-sm outline-none"
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  type="button" 
                  onClick={handleCancelarFormulario}
                  className="bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={guardando}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm cursor-pointer disabled:opacity-60"
                >
                  {guardando ? 'Guardando...' : 'Guardar Evento'}
                </button>
              </div>
              {errorFormulario && (
                <p role="alert" className="bg-red-100 text-red-800 px-4 py-2 text-sm">
                  {errorFormulario}
                </p>
              )}
            </form>
          </div>
        ) : (
          <table className="w-full border-collapse border border-gray-400 text-center mt-2">
            <thead>
              <tr className="bg-gray-200 text-sm">
                <th className="border border-gray-400 py-3 font-semibold">FECHA Y HORA</th>
                <th className="border border-gray-400 py-3 font-semibold">ESTADO</th>
                <th className="border border-gray-400 py-3 font-semibold">UBICACIÓN</th>
                <th className="border border-gray-400 py-3 font-semibold">DETALLE</th>
                <th className="border border-gray-400 py-3 font-semibold">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-gray-400 py-8 text-sm text-gray-600">
                    {cargando ? 'Consultando eventos...' : guiaConsultada ? 'No hay eventos para esta guía.' : 'Consulta una guía para cargar su historial.'}
                  </td>
                </tr>
              ) : eventos.map((evento) => (
                <tr key={evento.id} className="text-sm">
                  <td className="border border-gray-400 py-4">{evento.fechaHora}</td>
                  <td className="border border-gray-400 py-4">{evento.estado}</td>
                  <td className="border border-gray-400 py-4">{evento.ubicacion}</td>
                  <td className="border border-gray-400 py-4">{evento.detalle}</td>
                  <td className="border border-gray-400 py-4">
                    <button
                      type="button"
                      onClick={() => handleEliminarEvento(evento.id)}
                      className="text-red-700 underline cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};