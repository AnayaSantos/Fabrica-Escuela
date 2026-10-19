import React, { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { AlertaTiempoEntrega } from '@tracelog/hu-19';
import {
  DATOS_GUIA_EJEMPLO,
  esGuiaEjemplo,
  GUIA_EJEMPLO,
} from '@tracelog/hu-19/ejemplos';
import { formatearFechaEstimada } from '@tracelog/hu-15/fecha-estimada';
import type { DatosGuia, EstadoConsulta } from './types';
import { envioService } from './envioService';

export const ConsultaEnvio: React.FC = () => {
  const [numeroGuia, setNumeroGuia] = useState('');
  const [estadoConsulta, setEstadoConsulta] = useState<EstadoConsulta>('IDLE');
  const [cargando, setCargando] = useState(false);
  const [datos, setDatos] = useState<DatosGuia | null>(null);

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    const codigo = numeroGuia.trim();
    if (!codigo) return;

    setEstadoConsulta('IDLE');

    if (esGuiaEjemplo(codigo)) {
      setDatos(DATOS_GUIA_EJEMPLO);
      setEstadoConsulta('EXITO');
      return;
    }

    setCargando(true);

    try {
      const resultado = await envioService.consultarGuia(codigo);
      setDatos(resultado);
      setEstadoConsulta('EXITO');
    } catch {
      setDatos(null);
      setEstadoConsulta('ERROR');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div id="consulta-envio-container" className="flex flex-col items-center justify-center min-h-screen bg-white p-6 font-sans">
      <h1 id="titulo-principal" className="text-3xl font-normal text-black mb-2">Consultar envío</h1>
      <p id="subtitulo-instruccion" className="text-sm text-gray-700 mb-3">Ingrese el No. de guía</p>

      {/* Formulario de Búsqueda */}
      <form id="formulario-consulta" onSubmit={handleConsultar} className="flex flex-col items-center gap-3 w-full max-w-[340px] mb-5">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black pointer-events-none">
            <Search className="w-4 h-4 text-black stroke-[2.5]" />
          </span>
          <input
            id="input-numero-guia"
            type="text"
            value={numeroGuia}
            onChange={(e) => {
              setNumeroGuia(e.target.value);
              if (estadoConsulta === 'ERROR') {
                setEstadoConsulta('IDLE');
              }
            }}
            placeholder={GUIA_EJEMPLO}
            className={`w-full pl-9 pr-4 py-1.5 text-center text-sm border-2 border-black rounded-full outline-none transition-colors ${
              estadoConsulta === 'ERROR'
                ? 'bg-[#F87171] text-black font-semibold'
                : 'bg-white text-black'
            }`}
          />
        </div>

        <button
          id="btn-consultar"
          type="submit"
          disabled={cargando}
          className="bg-[#9da5b4] hover:bg-[#8e96a5] active:scale-95 disabled:opacity-70 transition-all text-black text-sm font-normal py-1 px-7 rounded-full border-2 border-black shadow-sm cursor-pointer"
        >
          {cargando ? 'Consultando...' : 'Consultar'}
        </button>
      </form>
      <p className="-mt-3 mb-5 max-w-[340px] text-center text-xs text-gray-500">
        Guía de demostración solo frontend: <code>{GUIA_EJEMPLO}</code>
      </p>

      {/* CA-02-A: Consulta Exitosa */}
      {estadoConsulta === 'EXITO' && datos && (
        <div id="resultado-exito" className="flex flex-col items-center w-full max-w-[340px]">
          <p id="mensaje-exito" className="text-[#16a34a] font-normal text-sm mb-3 text-center">
            No. de guía encontrado con éxito
          </p>
          {datos.fechaEstimadaEntrega && (
            <p className="mb-3 text-center text-sm text-black">
              Fecha estimada: {formatearFechaEstimada(datos.fechaEstimadaEntrega)}
            </p>
          )}
          
          <div id="tarjeta-timeline" className="w-full bg-[#D9D9D9] border-2 border-black rounded-xl p-5 shadow-sm">
            <div className="relative border-l-2 border-black ml-3.5 pl-6 space-y-5 py-2">
              {datos.eventos.map((evt, idx) => (
                <div key={idx} id={`evento-timeline-${idx}`} className="relative flex flex-col justify-center">
                  <span
                    className={`absolute -left-[37px] flex items-center justify-center w-6 h-6 rounded-full border-2 border-black ${
                      evt.completado ? 'bg-[#20409A]' : 'bg-[#B0B0B0]'
                    }`}
                  >
                    {evt.completado ? (
                      <Check className="w-4 h-4 text-[#008000] stroke-[3.5]" />
                    ) : null}
                  </span>
                  <p className="text-xs font-medium text-black leading-tight">{evt.titulo}</p>
                  <p className="text-[11px] text-gray-800">{evt.fechaHora}</p>
                </div>
              ))}
            </div>
          </div>
          <AlertaTiempoEntrega estado={datos.alertaTiempo} />
        </div>
      )}

      {/* CA-02-B: Guía Inexistente */}
      {estadoConsulta === 'ERROR' && (
        <div id="resultado-error" className="w-full max-w-[340px] bg-[#D9D9D9] border-2 border-black rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[160px] shadow-sm">
          <div className="mb-4 flex items-center justify-center">
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21.5 6.3c1.1-1.9 3.9-1.9 5 0l18.5 32c1.1 1.9-.3 4.3-2.5 4.3H5.5c-2.2 0-3.6-2.4-2.5-4.3l18.5-32z"
                fill="#F50036"
              />
              <rect x="22" y="18" width="4" height="11" rx="2" fill="white" />
              <circle cx="24" cy="34" r="2.5" fill="white" />
            </svg>
          </div>
          <p id="mensaje-error" className="text-[#FF0000] text-sm font-normal">
            Número de guía inexistente, intenta con otro.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsultaEnvio;
