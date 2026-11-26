import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { EstadoEnvio, EnvioActualizable } from '../types';
import { getEnvio, actualizarEstadoEnvio } from '../services/enviosService';

const ESTADOS_ENVIO: EstadoEnvio[] = [
  'Pendiente de recolección',
  'En tránsito',
  'En reparto',
  'Entregado',
  'Con incidencia',
  'Devuelto',
];

const TRANSICIONES_VALIDAS: Record<EstadoEnvio, EstadoEnvio[]> = {
  'Pendiente de recolección': ['En tránsito', 'Con incidencia'],
  'En tránsito': ['En reparto', 'Con incidencia', 'Devuelto'],
  'En reparto': ['Entregado', 'Con incidencia', 'Devuelto'],
  Entregado: [],
  'Con incidencia': ['En tránsito', 'En reparto', 'Devuelto'],
  Devuelto: [],
};

type ModalActivo = 'NINGUNO' | 'EXITO' | 'ERROR';

export const ActualizarEnvio: React.FC = () => {
  const [numeroGuia, setNumeroGuia] = useState('');
  const [envio, setEnvio] = useState<EnvioActualizable | null>(null);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const asignacionBloqueada = envio?.estadoActual === 'Entregado' || envio?.estadoActual === 'Devuelto';

  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoEnvio | ''>('');
  const [modalActivo, setModalActivo] = useState<ModalActivo>('NINGUNO');
  const [mensajeError, setMensajeError] = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState<{ estado: EstadoEnvio; fecha: string } | null>(null);

  const handleConsultarEnvio = async () => {
    const guia = numeroGuia.trim();
    if (!guia) return;

    setCargandoEnvio(true);
    setErrorCarga('');
    setEnvio(null);
    setEstadoSeleccionado('');
    setModalActivo('NINGUNO');
    try {
      setEnvio(await getEnvio(guia));
    } catch (error: unknown) {
      setErrorCarga(error instanceof Error ? error.message : 'No se pudo consultar el envío.');
    } finally {
      setCargandoEnvio(false);
    }
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!estadoSeleccionado) {
      setMensajeError('Selecciona un estado antes de continuar.');
      setModalActivo('ERROR');
      return;
    }

    if (!envio) {
      setErrorCarga('Consulta un envío antes de actualizar su estado.');
      return;
    }

    const permitidos = TRANSICIONES_VALIDAS[envio.estadoActual];
    if (!permitidos.includes(estadoSeleccionado)) {
      setMensajeError('El estado seleccionado no es válido. Por favor selecciona otro e intenta nuevamente.');
      setModalActivo('ERROR');
      return;
    }

    setEnviando(true);
    try {
      const actualizado = await actualizarEstadoEnvio(envio.numeroGuia, estadoSeleccionado);
      setEnvio(actualizado);
      setUltimaActualizacion({
        estado: actualizado.estadoActual,
        fecha: actualizado.fechaUltimaActualizacion,
      });
      setModalActivo('EXITO');
    } catch (error: unknown) {
      setMensajeError(error instanceof Error ? error.message : 'No se pudo actualizar el envío.');
      setModalActivo('ERROR');
    } finally {
      setEnviando(false);
    }
  };

  const cerrarModal = () => {
    setModalActivo('NINGUNO');
    setEstadoSeleccionado('');
    setMensajeError('');
  };

  return (
    <div id="actualizar-envio-container" className="relative flex flex-col items-center justify-center min-h-screen bg-white p-6 font-sans">
      <h1 id="titulo-actualizacion" className="text-3xl font-normal text-black mb-6">Actualización de envío</h1>

      <form id="formulario-actualizacion" onSubmit={handleActualizar} className="flex flex-col gap-4 w-full max-w-xs">
        <div className="flex flex-col gap-1">
          <label htmlFor="campo-numero-guia" className="text-xs text-gray-700">Envío No.:</label>
          <div className="flex gap-2">
            <input
              id="campo-numero-guia"
              type="text"
              value={numeroGuia}
              onChange={(event) => {
                setNumeroGuia(event.target.value);
                setEnvio(null);
                setEstadoSeleccionado('');
                setModalActivo('NINGUNO');
              }}
              placeholder="Ingrese una guía"
              className="w-full px-3 py-1.5 text-sm border border-gray-800 rounded-md bg-white text-black"
            />
            <button type="button" onClick={handleConsultarEnvio} disabled={cargandoEnvio || !numeroGuia.trim()} className="rounded-md border border-black bg-gray-200 px-3 text-xs disabled:opacity-50">
              {cargandoEnvio ? 'Consultando...' : 'Consultar'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="campo-estado-actual" className="text-xs text-gray-700">Estado actual:</label>
          <input
            id="campo-estado-actual"
            type="text"
            value={cargandoEnvio ? 'Consultando...' : envio?.estadoActual ?? 'No disponible'}
            disabled
            readOnly
            className="w-full px-3 py-1.5 text-sm border border-gray-800 rounded-md bg-gray-100 text-black"
          />
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <label htmlFor="select-nuevo-estado" className="text-xs text-gray-700">Selecciona un nuevo estado:</label>
          <select
            id="select-nuevo-estado"
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value as EstadoEnvio)}
            disabled={!envio || cargandoEnvio || asignacionBloqueada}
            className="w-full px-3 py-1.5 text-sm border border-gray-800 rounded-md bg-white text-black cursor-pointer"
          >
            <option value="" disabled>Seleccionar</option>
            {ESTADOS_ENVIO.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <button
          id="btn-actualizar-envio"
          type="submit"
          disabled={cargandoEnvio || enviando || !envio}
          className="mt-3 self-center w-40 bg-gray-400 hover:bg-gray-500 active:scale-95 transition text-black text-sm font-medium py-1.5 px-4 rounded-full border border-black shadow cursor-pointer"
        >
          {enviando ? 'Actualizando...' : 'Actualizar Envío'}
        </button>
        {errorCarga && <p role="alert" className="text-red-700 text-xs text-center">{errorCarga}</p>}
      </form>

      {modalActivo === 'EXITO' && ultimaActualizacion && envio && (
        <div id="overlay-modal-exito" className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 animate-fade-in">
          <div id="modal-exito" className="w-full max-w-xs bg-lime-50 border-2 border-green-700 rounded-xl p-5 flex flex-col items-center text-center gap-1 shadow-lg">
            <CheckCircle2 className="w-7 h-7 text-green-700 mb-1" />
            <p id="mensaje-exito" className="text-green-800 font-semibold text-sm">Envío actualizado correctamente</p>
            <p className="text-xs text-green-900">No. {envio.numeroGuia}</p>
            <p className="text-xs text-green-900">Estado actual: {ultimaActualizacion.estado}</p>
            <p className="text-[11px] text-green-800">{ultimaActualizacion.fecha}</p>
            <button
              id="btn-aceptar-exito"
              type="button"
              onClick={cerrarModal}
              className="mt-3 w-24 bg-green-700 hover:bg-green-800 active:scale-95 transition text-white text-xs font-medium py-1 rounded-full shadow cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {modalActivo === 'ERROR' && envio && (
        <div id="overlay-modal-error" className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 animate-fade-in">
          <div id="modal-error" className="w-full max-w-xs bg-red-500 border-2 border-red-700 rounded-xl p-5 flex flex-col items-center text-center gap-1 shadow-lg">
            <XCircle className="w-7 h-7 text-white mb-1" />
            <p id="mensaje-error-titulo" className="text-white font-semibold text-sm">Envío no actualizado</p>
            <p className="text-xs text-white">No. {envio.numeroGuia}</p>
            <p id="mensaje-error-detalle" className="text-xs text-white leading-snug">{mensajeError}</p>
            <button
              id="btn-aceptar-error"
              type="button"
              onClick={cerrarModal}
              className="mt-3 w-24 bg-white hover:bg-gray-100 active:scale-95 transition text-red-700 text-xs font-medium py-1 rounded-full shadow cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};