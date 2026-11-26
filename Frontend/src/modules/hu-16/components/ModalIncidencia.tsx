import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Upload, X } from 'lucide-react';
import { TIPOS_INCIDENCIA } from '../types';
import type { IncidenciaRegistrada, NuevaIncidencia, TipoIncidencia } from '../types';
import { registrarIncidencia } from '../services/incidenciasService';

const MAX_MB = 5;
const TIPOS_ARCHIVO = ['image/jpeg', 'image/png'];

interface ModalIncidenciaProps {
  numeroGuia: string;
  onCerrar: () => void;
  onRegistrada: (incidencia: IncidenciaRegistrada) => void;
}

interface Errores {
  tipo?: string;
  descripcion?: string;
  evidencia?: string;
}

const claseCampo = (error?: string) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
    error ? 'border-red-500 bg-red-50 focus:ring-red-300' : 'border-gray-300 bg-white focus:ring-blue-300'
  }`;

export function ModalIncidencia({ numeroGuia, onCerrar, onRegistrada }: ModalIncidenciaProps) {
  const [tipo, setTipo] = useState<TipoIncidencia | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [evidencia, setEvidencia] = useState<File | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [errorApi, setErrorApi] = useState('');
  const [guardando, setGuardando] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !guardando) onCerrar();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [guardando, onCerrar]);

  function elegirArchivo(archivo: File | undefined) {
    if (!archivo) return;
    if (!TIPOS_ARCHIVO.includes(archivo.type)) {
      setErrores((e) => ({ ...e, evidencia: 'Formato no permitido. Usa JPG o PNG.' }));
    } else if (archivo.size > MAX_MB * 1024 * 1024) {
      setErrores((e) => ({ ...e, evidencia: `El archivo supera los ${MAX_MB} MB.` }));
    } else {
      setErrores((e) => ({ ...e, evidencia: undefined }));
      setEvidencia(archivo);
    }
    if (inputArchivo.current) inputArchivo.current.value = '';
  }

  async function guardar() {
    const nuevos: Errores = { evidencia: errores.evidencia };
    if (!tipo) nuevos.tipo = 'Selecciona el tipo de incidencia.';
    if (!descripcion.trim()) nuevos.descripcion = 'Describe el problema para registrar la incidencia.';
    setErrores(nuevos);
    if (nuevos.tipo || nuevos.descripcion) return;

    setGuardando(true);
    setErrorApi('');
    try {
      const datos: NuevaIncidencia = { tipo: tipo as TipoIncidencia, descripcion, evidencia };
      const incidencia = await registrarIncidencia(numeroGuia, datos);
      onRegistrada(incidencia);
    } catch (e) {
      setErrorApi(e instanceof Error ? e.message : 'No se pudo registrar la incidencia. Intenta de nuevo.');
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) onCerrar(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-incidencia"
        className="max-h-[95vh] w-full max-w-xl overflow-auto rounded-xl bg-white shadow-2xl"
      >
        <header className="border-b border-gray-300 px-6 py-5">
          <h2 id="titulo-modal-incidencia" className="text-lg font-semibold">
            Registrar Incidencia sobre Envío - Guía #{numeroGuia}
          </h2>
          <p className="mt-1 text-sm text-gray-500">Describe la novedad para dar seguimiento al envío.</p>
        </header>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo-incidencia" className="text-sm font-semibold">Tipo de incidencia *</label>
            <div className="relative">
              <select
                id="tipo-incidencia"
                value={tipo}
                aria-invalid={!!errores.tipo}
                className={`${claseCampo(errores.tipo)} appearance-none pr-9`}
                onChange={(e) => { setTipo(e.target.value as TipoIncidencia); setErrores((x) => ({ ...x, tipo: undefined })); }}
              >
                <option value="" disabled>Selecciona una opción</option>
                {TIPOS_INCIDENCIA.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            </div>
            {errores.tipo && <p role="alert" className="text-xs text-red-600">{errores.tipo}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="descripcion-incidencia" className="text-sm font-semibold">Descripción del problema *</label>
            <textarea
              id="descripcion-incidencia"
              rows={4}
              value={descripcion}
              aria-invalid={!!errores.descripcion}
              className={`${claseCampo(errores.descripcion)} resize-y`}
              onChange={(e) => { setDescripcion(e.target.value); setErrores((x) => ({ ...x, descripcion: undefined })); }}
            />
            {errores.descripcion && <p role="alert" className="text-xs text-red-600">{errores.descripcion}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                ref={inputArchivo}
                type="file"
                hidden
                accept=".jpg,.jpeg,.png"
                onChange={(e) => elegirArchivo(e.target.files?.[0])}
              />
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                onClick={() => inputArchivo.current?.click()}
              >
                <Upload size={14} aria-hidden="true" /> Subir Evidencia
              </button>
              <p className="text-xs leading-snug text-gray-500">
                Opcional · JPG o PNG<br />Hasta {MAX_MB} MB por archivo
              </p>
            </div>
            {evidencia && (
              <p className="inline-flex w-fit items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1 text-xs">
                {evidencia.name}
                <button type="button" aria-label="Quitar archivo" onClick={() => setEvidencia(null)}>
                  <X size={14} aria-hidden="true" />
                </button>
              </p>
            )}
            {errores.evidencia && <p role="alert" className="text-xs text-red-600">{errores.evidencia}</p>}
          </div>

          {errorApi && (
            <p role="alert" className="rounded-lg border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-600">{errorApi}</p>
          )}
        </div>

        <footer className="flex justify-end gap-2.5 border-t border-gray-300 px-6 py-4">
          <button
            type="button"
            disabled={guardando}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
            onClick={onCerrar}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={guardando}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            onClick={guardar}
          >
            {guardando ? 'Guardando…' : 'Guardar incidencia'}
          </button>
        </footer>
      </div>
    </div>
  );
}
