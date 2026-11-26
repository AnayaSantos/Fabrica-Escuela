import { AlertCircle, History, LoaderCircle, RotateCcw, Search } from 'lucide-react';
import { ApiError } from '@tracelog/api-client';
import { useState, type FormEvent } from 'react';
import type { HistorialConsulta } from '../types';
import { consultarHistorial } from '../services/historialMovimientosService';
import { EstadoVacio } from './EstadoVacio';
import { LineaTiempoMovimientos } from './LineaTiempoMovimientos';
import { ResumenEnvio } from './ResumenEnvio';
import { TimelineEmptyState } from './TimelineEmptyState';

export function HistorialMovimientos() {
  const [numeroGuia, setNumeroGuia] = useState('');
  const [guiaConsultada, setGuiaConsultada] = useState('');
  const [resultado, setResultado] = useState<HistorialConsulta | null>(null);
  const [estado, setEstado] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensajeError, setMensajeError] = useState('');
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [mensajeValidacion, setMensajeValidacion] = useState('');

  const consultar = async (guia: string) => {
    const normalizada = guia.trim().toUpperCase();
    if (!normalizada) {
      setMensajeValidacion('Ingresa un número de guía para consultar el historial.');
      return;
    }
    setMensajeValidacion('');
    setEstado('loading');
    setMensajeError('');
    setNoEncontrada(false);
    setResultado(null);
    try {
      const datos = await consultarHistorial(normalizada);
      setGuiaConsultada(normalizada);
      setResultado(datos);
      setEstado('success');
    } catch (error: unknown) {
      setGuiaConsultada('');
      setEstado('error');
      if (error instanceof ApiError && error.status === 404) {
        setNoEncontrada(true);
        setMensajeError('Número de guía inexistente.');
      } else {
        setMensajeError(error instanceof Error ? error.message : 'No se pudo consultar el historial.');
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void consultar(numeroGuia);
  };

  const cargando = estado === 'loading';

  return (
    <div id="historial-movimientos-container" className="relative flex flex-col items-center justify-center min-h-screen bg-white p-6 font-sans">
      <header className="historial-header">
        <h1 id="titulo-historial">
          <History size={24} aria-hidden="true" /> Historial de movimientos
        </h1>
        <p className="historial-subtitle">
          Consulta la trazabilidad completa y toma decisiones operativas con información confiable.
        </p>
      </header>

      <form id="formulario-historial" onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1">
          <label htmlFor="campo-numero-guia">Envío No.:</label>
          <div className="flex gap-2">
            <div className="relative w-full">
              <Search className="historial-search-icon pointer-events-none absolute left-3" size={18} aria-hidden="true" />
              <input
                id="campo-numero-guia"
                type="text"
                value={numeroGuia}
                onChange={(event) => {
                  setNumeroGuia(event.target.value);
                  if (mensajeValidacion) setMensajeValidacion('');
                }}
                placeholder="Ingrese una guía"
                aria-invalid={Boolean(mensajeValidacion)}
                aria-describedby={mensajeValidacion ? 'mensaje-validacion-historial' : undefined}
              />
            </div>
            <button type="submit" disabled={cargando}>
              {cargando ? (
                <>
                  <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
                  Consultando...
                </>
              ) : 'Consultar'}
            </button>
          </div>
        </div>
        {mensajeValidacion && (
          <p id="mensaje-validacion-historial" className="historial-validation" role="alert">
            {mensajeValidacion}
          </p>
        )}
      </form>

      <div className="w-full" aria-live="polite" aria-busy={cargando}>
        {estado === 'idle' && <TimelineEmptyState />}
        {cargando && (
          <div id="resultado-error-historial" className="text-center" role="status">
            Consultando el historial del envío…
          </div>
        )}
        {estado === 'error' && (
          <div id="resultado-error-historial" className="flex flex-col items-center gap-3 text-center" role="alert">
            <AlertCircle size={38} aria-hidden="true" />
            <p>{mensajeError}</p>
            {!noEncontrada && (
              <button type="button" onClick={() => void consultar(numeroGuia)}>
                <RotateCcw size={16} aria-hidden="true" /> Reintentar
              </button>
            )}
          </div>
        )}
        {estado === 'success' && resultado && (
          <section id="tarjeta-historial">
            <ResumenEnvio numeroGuia={guiaConsultada} eventos={resultado.eventos} resumen={resultado.resumen} />
            {resultado.eventos.length ? <LineaTiempoMovimientos eventos={resultado.eventos} /> : (
              <div id="resultado-error-historial" role="alert">
                <EstadoVacio />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
