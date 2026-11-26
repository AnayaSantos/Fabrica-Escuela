import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { enviosService } from '../services/enviosService';
import { ESTADOS_ENVIO, type EnvioListado } from '../types';

function normalizar(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function BuscarEnvios() {
  const [envios, setEnvios] = useState<EnvioListado[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [destino, setDestino] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    enviosService
      .listar()
      .then((resultado) => {
        if (activo) setEnvios(resultado);
      }).catch((error: unknown) => {
        if (activo) {
          setError(error instanceof Error
            ? error.message
            : 'No fue posible cargar los envíos. Intenta nuevamente.');
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const enviosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda);
    const ciudad = normalizar(destino);

    return envios.filter((envio) => {
      const coincideBusqueda =
        !texto || normalizar(envio.numeroGuia).includes(texto);
      const coincideEstado = !estado || envio.estadoActual === estado;
      const coincideDestino = !ciudad || normalizar(envio.destino).includes(ciudad);
      return coincideBusqueda && coincideEstado && coincideDestino;
    });
  }, [busqueda, destino, estado, envios]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setEstado('');
    setDestino('');
  };

  return (
    <main id="buscar-envios-container" className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-left">Buscar y filtrar envíos</h1>
          <p className="text-slate-600">
            Consulta los envíos y filtra los resultados por estado o destino.
          </p>
        </div>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Filtros de envíos">
          <div className="mb-4 flex items-center gap-2 text-slate-800">
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            <h2 className="m-0 text-lg">Filtros</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end">
            <label>
              Número de guía
              <span className="relative mt-1 block">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  aria-label="Buscar por número de guía"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Ej. TRK-001"
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </span>
            </label>
            <label>
              Estado
              <select
                aria-label="Filtrar por estado"
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Todos los estados</option>
                {ESTADOS_ENVIO.map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
            </label>
            <label>
              Destino
              <input
                aria-label="Filtrar por destino"
                value={destino}
                onChange={(event) => setDestino(event.target.value)}
                placeholder="Ciudad o dirección"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <button type="button" onClick={limpiarFiltros} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
              <X className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-live="polite">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="m-0 text-lg">Resultados</h2>
            {!cargando && !error && <span className="text-sm text-slate-500">{enviosFiltrados.length} envío(s)</span>}
          </div>
          {cargando && <p className="p-6 text-slate-600">Cargando envíos...</p>}
          {error && <p role="alert" className="p-6 text-red-700">{error}</p>}
          {!cargando && !error && enviosFiltrados.length === 0 && (
            <p className="p-6 text-slate-600">No hay envíos que coincidan con los filtros seleccionados.</p>
          )}
          {!cargando && !error && enviosFiltrados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Número de guía</th>
                    <th className="px-5 py-3 font-semibold">Estado</th>
                    <th className="px-5 py-3 font-semibold">Destino</th>
                    <th className="px-5 py-3 font-semibold">Última actualización</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {enviosFiltrados.map((envio) => (
                    <tr key={envio.numeroGuia} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-900">{envio.numeroGuia}</td>
                      <td className="px-5 py-4">{envio.estadoActual}</td>
                      <td className="px-5 py-4">{envio.destino}</td>
                      <td className="px-5 py-4 text-slate-600">{envio.fechaUltimaActualizacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
