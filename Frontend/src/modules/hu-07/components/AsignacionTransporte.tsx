import { useEffect, useState, type FormEvent } from 'react';
import {
  asignacionTransporteService,
  type EstadoEnvio,
  type RutaTransporte,
  type VehiculoDisponible,
} from '../services/asignacionTransporteService';

export const AsignacionTransporte = () => {
  const [numeroGuia, setNumeroGuia] = useState('');
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio | null>(null);
  const [rutas, setRutas] = useState<RutaTransporte[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoDisponible[]>([]);
  const [ruta, setRuta] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [consultando, setConsultando] = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [errorServicio, setErrorServicio] = useState('');
  const [mostrarError, setMostrarError] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  const asignacionBloqueada = estadoEnvio === 'Entregado' || estadoEnvio === 'Devuelto';

  useEffect(() => {
    let activo = true;
    Promise.all([
      asignacionTransporteService.obtenerRutas(),
      asignacionTransporteService.obtenerVehiculosDisponibles(),
    ])
      .then(([rutasDisponibles, vehiculosDisponibles]) => {
        if (!activo) return;
        setRutas(rutasDisponibles);
        setVehiculos(vehiculosDisponibles);
      })
      .catch((error: unknown) => {
        if (activo) setErrorServicio(error instanceof Error ? error.message : 'No se pudieron cargar rutas y vehículos.');
      })
      .finally(() => {
        if (activo) setCargandoCatalogos(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const handleConsultarEnvio = async (event: FormEvent) => {
    event.preventDefault();
    if (!numeroGuia.trim()) return;

    setConsultando(true);
    setErrorServicio('');
    setEstadoEnvio(null);
    try {
      const envio = await asignacionTransporteService.consultarEnvio(numeroGuia);
      setEstadoEnvio(envio.estadoActual);
    } catch (error: unknown) {
      setErrorServicio(error instanceof Error ? error.message : 'No se pudo consultar el envío.');
    } finally {
      setConsultando(false);
    }
  };

  const handleAsignar = async (event: FormEvent) => {
    event.preventDefault();
    setMostrarExito(false);
    setMostrarError(false);

    if (!numeroGuia.trim() || !estadoEnvio || !ruta || !vehiculo) {
      setMostrarError(true);
      return;
    }
    if (asignacionBloqueada) return;

    setAsignando(true);
    setErrorServicio('');
    try {
      await asignacionTransporteService.asignar(numeroGuia, {
        rutaId: ruta,
        vehiculoId: vehiculo,
      });
      setMostrarExito(true);
    } catch (error: unknown) {
      setErrorServicio(error instanceof Error ? error.message : 'No se pudo asignar el transporte.');
    } finally {
      setAsignando(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <main className="mx-auto w-full max-w-4xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">Administración logística</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Asignación de transporte</h1>
            <p className="mt-2 text-sm text-slate-600">
              Consulta el estado del envío y asigne la ruta y vehículo disponibles.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <section className="w-full rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition-all sm:p-8">
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Detalles del envío:</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-700">ID:</span>
                <span className="font-medium text-slate-900">{numeroGuia || 'Sin consultar'}</span>
                <span className="text-slate-500">|</span>
                <span className={estadoEnvio ? 'font-medium text-emerald-700' : 'text-slate-500'}>
                  Estado: {estadoEnvio ?? 'No consultado'}.
                </span>
              </div>
            </div>

            <form onSubmit={handleConsultarEnvio} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="numero-guia" className="mb-1.5 block text-base sm:text-lg text-neutral-800 select-none font-normal">
                  Número de guía
                </label>
                <input
                  id="numero-guia"
                  value={numeroGuia}
                  onChange={(event) => {
                    setNumeroGuia(event.target.value);
                    setEstadoEnvio(null);
                    setMostrarError(false);
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-base text-neutral-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600"
                  placeholder="Ingrese una guía"
                />
              </div>
              <button
                type="submit"
                disabled={consultando || !numeroGuia.trim()}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {consultando ? 'Consultando...' : 'Consultar envío'}
              </button>
            </form>
          </section>

          <section className="w-full rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition-all sm:p-8">
            <form onSubmit={handleAsignar} className="space-y-6">
              <div className="flex flex-col">
                <label className="mb-1.5 block text-base sm:text-lg text-neutral-800 select-none font-normal">
                  Seleccione ruta de transporte:<span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <select
                    value={ruta}
                    onChange={(e) => { setRuta(e.target.value); setMostrarError(false); }}
                    disabled={asignacionBloqueada || !estadoEnvio || cargandoCatalogos}
                    className={`w-full rounded-2xl border bg-white px-3 py-2 text-base text-neutral-900 outline-none transition appearance-none cursor-pointer ${
                      asignacionBloqueada
                        ? 'border-slate-300 text-slate-400'
                        : 'border-slate-300 focus:border-blue-600'
                    } ${mostrarError && !ruta ? 'border-2 border-red-600' : ''}`}
                  >
                    <option value="">Seleccione una opción...</option>
                    {rutas.map((opcionRuta) => (
                      <option key={opcionRuta.id} value={opcionRuta.id}>
                        {opcionRuta.nombre}: {opcionRuta.centroOrigenNombre} - {opcionRuta.centroDestinoNombre}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-900">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 block text-base sm:text-lg text-neutral-800 select-none font-normal">
                  Selecciones Vehículo:<span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <select
                    value={vehiculo}
                    onChange={(e) => { setVehiculo(e.target.value); setMostrarError(false); }}
                    disabled={asignacionBloqueada || !estadoEnvio || cargandoCatalogos}
                    className={`w-full rounded-2xl border bg-white px-3 py-2 text-base text-neutral-900 outline-none transition appearance-none cursor-pointer ${
                      asignacionBloqueada
                        ? 'border-slate-300 text-slate-400'
                        : 'border-slate-300 focus:border-blue-600'
                    } ${mostrarError && !vehiculo ? 'border-2 border-red-600' : ''}`}
                  >
                    <option value="">Seleccione una opción...</option>
                    {vehiculos.map((opcionVehiculo) => (
                      <option key={opcionVehiculo.id} value={opcionVehiculo.id}>
                        {opcionVehiculo.conductor} - Placa {opcionVehiculo.placa}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-900">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>

                {mostrarError && (
                  <p className="mt-1 text-xs sm:text-sm text-neutral-900 font-normal">
                    *!Debes seleccionar una ruta y un vehículo válidos¡
                  </p>
                )}
              </div>

              {asignacionBloqueada && (
                <div className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-center">
                  <p className="text-sm text-slate-700">
                    El estado actual del envío no permite nuevas<br />asignaciones
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={asignacionBloqueada || cargandoCatalogos || consultando || asignando || !estadoEnvio}
                  className={`rounded-2xl px-8 py-2.5 text-base font-medium shadow-sm transition sm:text-lg cursor-pointer ${
                    asignacionBloqueada
                      ? 'border border-slate-300 bg-slate-200 text-slate-400'
                      : 'bg-slate-800 text-white hover:-translate-y-0.5 hover:bg-slate-900 active:translate-y-0'
                  }`}
                >
                  {cargandoCatalogos ? 'Cargando opciones...' : asignando ? 'Asignando...' : 'Asignar Transporte'}
                </button>
              </div>

              {errorServicio && <p role="alert" className="text-center text-sm text-red-700">{errorServicio}</p>}

              {mostrarExito && !asignacionBloqueada && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-6 py-2.5 text-sm font-medium text-emerald-800 shadow-sm sm:text-base">
                    <span className="text-base">✅</span>
                    <span>Envío asignado a la ruta exitosamente</span>
                  </div>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};