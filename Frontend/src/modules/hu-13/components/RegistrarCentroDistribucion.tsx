import React, { useState, useEffect } from 'react';
import { ApiError } from '@tracelog/api-client';
import type {
  CentroDistribucion,
  FormularioErrores,
  VistaTab,
} from '../types';
import {
  centroDistribucionService,
  CIUDADES_COLOMBIA,
} from '../services/centroDistribucionService';
import {
  Building2,
  MapPin,
  Package,
  Search,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  Navigation,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const RegistrarCentroDistribucion: React.FC = () => {
  // Estado de datos
  const [centros, setCentros] = useState<CentroDistribucion[]>([]);
  const [vistaActual, setVistaActual] = useState<VistaTab>('registro');

  // Estados de campos del formulario
  const [nombre, setNombre] = useState<string>('');
  const [ciudad, setCiudad] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');

  // Estados de validación y retroalimentación
  const [errores, setErrores] = useState<FormularioErrores>({});
  const [errorDuplicado, setErrorDuplicado] = useState<boolean>(false);
  const [errorGeneral, setErrorGeneral] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<boolean>(false);
  const [ultimoRegistrado, setUltimoRegistrado] = useState<CentroDistribucion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensajeServicio, setMensajeServicio] = useState('');

  // Estados del listado
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [ciudadFiltro, setCiudadFiltro] = useState<string>('');
  const [confirmarEliminarId, setConfirmarEliminarId] = useState<string | null>(null);

  // Cargar centros al inicializar
  useEffect(() => {
    let activa = true;
    centroDistribucionService.obtenerCentros()
      .then((listado) => {
        if (activa) setCentros(listado);
      })
      .catch((error: unknown) => {
        if (activa) {
          setErrorGeneral(true);
          setMensajeServicio(error instanceof Error ? error.message : 'No se pudieron cargar los centros.');
        }
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, []);

  // Manejador del formulario de registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reiniciar estados previos de feedback
    setMensajeExito(false);
    setErrorDuplicado(false);
    setErrorGeneral(false);

    const nuevosErrores: FormularioErrores = {};

    // Validación de campos obligatorios
    if (!nombre.trim()) {
      nuevosErrores.nombre = 'Este campo es obligatorio';
    }
    if (!ciudad.trim() || ciudad === 'Seleccionar ciudad') {
      nuevosErrores.ciudad = 'Este campo es obligatorio';
    }
    if (!direccion.trim()) {
      nuevosErrores.direccion = 'Este campo es obligatorio';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setErrorGeneral(true);
      return;
    }

    setErrores({});

    // Invocar servicio para registro y validación de duplicados
    setCargando(true);
    setMensajeServicio('');
    try {
      const respuesta = await centroDistribucionService.registrarCentro({
        nombre,
        ciudad,
        direccion,
      });
      if (!respuesta.exito) {
        setErrorGeneral(true);
        if (respuesta.codigoEstado === 409) {
          setErrorDuplicado(true);
        } else {
          setMensajeServicio(respuesta.mensaje);
        }
        return;
      }
      const listaActualizada = await centroDistribucionService.obtenerCentros();
      setCentros(listaActualizada);
      setUltimoRegistrado(respuesta.datos ?? null);
      setMensajeExito(true);
      setErrorDuplicado(false);
      setErrorGeneral(false);
    } catch (error: unknown) {
      setErrorGeneral(true);
      if (error instanceof ApiError && error.status === 409) {
        setErrorDuplicado(true);
      } else {
        setMensajeServicio(error instanceof Error ? error.message : 'No se pudo registrar el centro.');
      }
    } finally {
      setCargando(false);
    }
  };

  // Filtrado de centros
  const centrosFiltrados = centros.filter((c) => {
    const coincideTexto =
      c.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      c.direccion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      c.codigo.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      c.ciudad.toLowerCase().includes(terminoBusqueda.toLowerCase());

    const coincideCiudad = !ciudadFiltro || c.ciudad === ciudadFiltro;
    return coincideTexto && coincideCiudad;
  });

  const exportarCSV = () => {
    const encabezados = ['ID', 'Código', 'Nombre', 'Ciudad', 'Dirección', 'Estado', 'Paquetes en Tránsito', 'Fecha'];
    const filas = centros.map((c) => [
      c.id,
      c.codigo,
      `"${c.nombre}"`,
      `"${c.ciudad}"`,
      `"${c.direccion}"`,
      c.estado,
      c.paquetesEnTransito || 0,
      c.fechaCreacion,
    ]);
    const contenido = [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `centros_distribucion_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEliminarCentro = async (id: string) => {
    setMensajeServicio('');
    try {
      await centroDistribucionService.eliminarCentro(id);
      setCentros((actuales) => actuales.filter((centro) => centro.id !== id));
      setConfirmarEliminarId(null);
    } catch (error: unknown) {
      setErrorGeneral(true);
      setMensajeServicio(error instanceof Error ? error.message : 'No se pudo eliminar el centro.');
    }
  };

  const handleActualizarListado = async () => {
    setCargando(true);
    setMensajeServicio('');
    try {
      setCentros(await centroDistribucionService.obtenerCentros());
      setErrorGeneral(false);
    } catch (error: unknown) {
      setErrorGeneral(true);
      setMensajeServicio(error instanceof Error ? error.message : 'No se pudo actualizar el listado.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div id="registrar-centro-container" className="w-full min-h-screen bg-slate-100 text-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <main className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">Administración logística</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Gestión de Centros de Distribución
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Registra y consulta los nodos que sostienen la operación de la red.
            </p>
          </div>
          <div className="flex w-full gap-2 rounded-xl border border-slate-300 bg-white p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setVistaActual('registro')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer sm:flex-none ${
                vistaActual === 'registro' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Nuevo Centro
            </button>
            <button
              type="button"
              onClick={() => setVistaActual('listado')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer sm:flex-none ${
                vistaActual === 'listado' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Ver Centros
            </button>
          </div>
        </header>
        {vistaActual === 'registro' && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <div
              id="tarjeta-formulario-centro"
              className="w-full rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition-all sm:p-10 lg:col-span-2"
            >
              <h2 className="mb-8 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Registrar Centro de Distribución
              </h2>

              <form
                id="formulario-registro-centro"
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6"
              >
                {/* Campo 1: Nombre del centro */}
                <div className="flex flex-col">
                  <label
                    htmlFor="nombre-centro"
                    className="text-base sm:text-lg text-neutral-800 mb-1.5 select-none font-normal"
                  >
                    Nombre del centro:*
                  </label>
                  <input
                    id="nombre-centro"
                    type="text"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (errores.nombre) {
                        setErrores((prev) => ({ ...prev, nombre: undefined }));
                      }
                    }}
                    placeholder="Ej. Bodega Central Norte"
                    className={`w-full rounded-2xl px-3 py-2 text-base text-neutral-900 bg-white outline-none transition ${
                      errores.nombre
                        ? 'border-2 border-red-600'
                        : 'border border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {errores.nombre && (
                    <span className="text-xs sm:text-sm text-neutral-900 mt-1 font-normal">
                      * {errores.nombre}
                    </span>
                  )}
                </div>

                {/* Campo 2: Ciudad */}
                <div className="flex flex-col">
                  <label
                    htmlFor="ciudad-centro"
                    className="text-base sm:text-lg text-neutral-800 mb-1.5 select-none font-normal"
                  >
                    Ciudad:*
                  </label>
                  <div className="relative">
                    <select
                      id="ciudad-centro"
                      value={ciudad}
                      onChange={(e) => {
                        setCiudad(e.target.value);
                        if (errores.ciudad) {
                          setErrores((prev) => ({ ...prev, ciudad: undefined }));
                        }
                      }}
                      className={`w-full rounded-2xl px-3 py-2 text-base text-neutral-900 bg-white outline-none appearance-none cursor-pointer transition ${
                        errores.ciudad
                          ? 'border-2 border-red-600'
                          : 'border border-slate-300 focus:border-blue-600'
                      }`}
                    >
                      <option value="">Seleccionar ciudad</option>
                      {CIUDADES_COLOMBIA.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-900">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  {errores.ciudad && (
                    <span className="text-xs sm:text-sm text-neutral-900 mt-1 font-normal">
                      * {errores.ciudad}
                    </span>
                  )}
                </div>

                {/* Campo 3: Dirección completa */}
                <div className="flex flex-col">
                  <label
                    htmlFor="direccion-centro"
                    className="text-base sm:text-lg text-neutral-800 mb-1.5 select-none font-normal"
                  >
                    Dirección completa:*
                  </label>
                  <input
                    id="direccion-centro"
                    type="text"
                    value={direccion}
                    onChange={(e) => {
                      setDireccion(e.target.value);
                      if (errores.direccion) {
                        setErrores((prev) => ({ ...prev, direccion: undefined }));
                      }
                    }}
                    placeholder="Ej. Calle 10 # 43A - 12"
                    className={`w-full rounded-2xl px-3 py-2 text-base text-neutral-900 bg-white outline-none transition ${
                      errores.direccion
                        ? 'border-2 border-red-600'
                        : 'border border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {errores.direccion && (
                    <span className="text-xs sm:text-sm text-neutral-900 mt-1 font-normal">
                      * {errores.direccion}
                    </span>
                  )}
                </div>

                {/* Mensaje de Éxito */}
                {mensajeExito && (
                  <div
                    id="mensaje-exito"
                    role="status"
                    className="pt-2 flex flex-col items-center animate-in fade-in zoom-in duration-200"
                  >
                    <div className="w-auto inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-6 py-2.5 text-sm font-medium text-emerald-800 shadow-sm sm:text-base">
                      <span className="text-base">✅</span>
                      <span>Centro de distribución registrado correctamente.</span>
                    </div>
                    {ultimoRegistrado && (
                      <div className="mt-3 text-xs text-neutral-600 text-center">
                        Código: <strong className="text-neutral-900 font-mono">{ultimoRegistrado.codigo}</strong> • ID:{' '}
                        <span className="font-mono">{ultimoRegistrado.id}</span>
                        <button
                          type="button"
                          onClick={() => setVistaActual('listado')}
                          className="ml-2 text-blue-600 underline font-medium hover:text-blue-800 cursor-pointer"
                        >
                          Ver en listado
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Alerta de Duplicado */}
                {errorDuplicado && (
                  <div
                    id="alerta-duplicado"
                    role="alert"
                    className="pt-2 flex flex-col items-center animate-in fade-in duration-200"
                  >
                    <div className="w-full rounded-2xl border border-red-200 bg-[#ffebeb] px-4 py-3 flex items-center justify-center gap-2 text-neutral-900 text-center text-sm sm:text-base">
                      <span className="text-sm font-bold text-neutral-900">▲</span>
                      <span>Ya existe un centro de distribución con estos datos en la ciudad seleccionada.</span>
                    </div>
                  </div>
                )}

                {/* Aviso de Error */}
                {errorGeneral && (
                  <div
                    id="error-general"
                    role="alert"
                    className="text-center pt-1"
                  >
                    <span className="text-red-600 text-base sm:text-lg font-normal tracking-wide">
                      {mensajeServicio || '¡Error al crear centro de distribución!'}
                    </span>
                  </div>
                )}

                {/* Botón de Envío */}
                <div className="flex justify-center pt-2">
                  <button
                    id="boton-guardar-centro"
                    type="submit"
                    disabled={cargando}
                    className="rounded-2xl bg-slate-800 px-8 py-2.5 text-base font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-900 active:translate-y-0 sm:text-lg cursor-pointer"
                  >
                    Guardar centro de distribución
                  </button>
                </div>
              </form>
            </div>
            <aside className="rounded-2xl border border-slate-300 bg-slate-800 p-6 text-white shadow-sm sm:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700 text-blue-200">
                <Navigation className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Impacto en la Red</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Cada centro registrado amplía la capacidad operativa y mejora la trazabilidad de los envíos.
              </p>
              <div className="mt-8 space-y-4 border-t border-slate-700 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-300">Centros activos</span>
                  <span className="text-xl font-bold text-white">{centros.length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-300">Ciudades cubiertas</span>
                  <span className="text-xl font-bold text-white">{new Set(centros.map((c) => c.ciudad)).size}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-300">Paquetes en tránsito</span>
                  <span className="text-xl font-bold text-white">
                    {centros.reduce((acc, c) => acc + (c.paquetesEnTransito || 0), 0)}
                  </span>
                </div>
              </div>
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-4 text-xs leading-relaxed text-slate-300">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>Los datos se validan antes de incorporarse a la red logística.</span>
              </div>
            </aside>
          </div>
        )}

        {/* Vista Listado de Centros */}
        {vistaActual === 'listado' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Centros Registrados
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{centros.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Puntos de acopio activos</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ciudades Cubiertas
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {new Set(centros.map((c) => c.ciudad)).size}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Nodos territoriales</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Paquetes Asociados
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {centros.reduce((acc, c) => acc + (c.paquetesEnTransito || 0), 0)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">En tránsito en la red</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Barra de Filtros y Acciones */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, código, dirección..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition"
                  />
                </div>

                <div className="relative min-w-[160px]">
                  <select
                    value={ciudadFiltro}
                    onChange={(e) => setCiudadFiltro(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Todas las ciudades</option>
                    {CIUDADES_COLOMBIA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={exportarCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>

                <button
                  type="button"
                  onClick={handleActualizarListado}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                  title="Volver a consultar el backend"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Actualizar
                </button>

                <button
                  type="button"
                  onClick={() => setVistaActual('registro')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nuevo Centro
                </button>
              </div>
            </div>

            {/* Tabla de Centros */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Código / ID</th>
                      <th className="px-5 py-3.5">Nombre del Centro</th>
                      <th className="px-5 py-3.5">Ciudad</th>
                      <th className="px-5 py-3.5">Dirección Completa</th>
                      <th className="px-5 py-3.5">Estado</th>
                      <th className="px-5 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {centrosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                          {cargando ? 'Cargando centros...' : 'No se encontraron centros de distribución con los filtros seleccionados.'}
                        </td>
                      </tr>
                    ) : (
                      centrosFiltrados.map((centro) => (
                        <tr key={centro.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                              {centro.codigo}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">{centro.id}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">{centro.nombre}</div>
                            {centro.notas && (
                              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {centro.notas}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-slate-800 font-medium text-xs bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                              <MapPin className="w-3 h-3 text-red-500" />
                              {centro.ciudad}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            <div className="max-w-xs">{centro.direccion}</div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                centro.estado === 'Activo'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                            >
                              ● {centro.estado}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {confirmarEliminarId === centro.id ? (
                                <div className="inline-flex items-center gap-1 bg-red-50 p-1 rounded border border-red-200">
                                  <span className="text-[11px] text-red-700 font-medium">¿Eliminar?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarCentro(centro.id)}
                                    className="text-xs px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmarEliminarId(null)}
                                    className="text-xs px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmarEliminarId(centro.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Eliminar centro de distribución"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Vista Red Logística y Trazabilidad */}
        {vistaActual === 'red' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
                <Navigation className="w-3.5 h-3.5" />
                Red Operativa Nacional
              </div>
              <h2 className="text-2xl font-bold">Puntos de Paso y Trazabilidad de Envíos</h2>
              <p className="text-blue-100 text-sm mt-2 max-w-3xl leading-relaxed">
                Los centros de distribución registrados conforman los nodos operativos de la red logística.
                Cada punto permite el escaneo, control de custodia y registro cronológico de eventos para garantizar
                la consistencia de los envíos en tránsito.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nodos activos */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Nodos de Acopio Operativos ({centros.length})
                </h3>
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {centros.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-700">{c.codigo}</span>
                        <span className="font-medium text-slate-600">{c.ciudad}</span>
                      </div>
                      <div className="font-semibold text-slate-900 text-sm">{c.nombre}</div>
                      <div className="text-slate-500">{c.direccion}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trazabilidad en acción */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Ejemplo de Historial de Envío en Ruta
                  </h3>
                  <span className="font-mono text-xs font-semibold text-slate-700">GUIA-98412</span>
                </div>
                <p className="text-xs text-slate-600">
                  Historial generado asociando eventos a los centros registrados:
                </p>

                <div className="space-y-3 pl-4 border-l-2 border-blue-400 ml-2 text-xs">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <div className="font-semibold text-slate-900">
                      Bodega Central Norte (Medellín, Antioquia)
                    </div>
                    <div className="text-slate-500 text-[11px]">2026-10-04 14:20 • Recepción y pesaje</div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <div className="font-semibold text-slate-900">
                      Centro Logístico Fontibón (Bogotá, D.C.)
                    </div>
                    <div className="text-slate-500 text-[11px]">2026-10-05 06:10 • Arribo y clasificación</div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-white" />
                    <div className="font-semibold text-slate-900">
                      En ruta de entrega hacia destino final
                    </div>
                    <div className="text-slate-500 text-[11px]">2026-10-05 08:30 • Asignado a transportador</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pie de Página Institucional */}
      <footer className="w-full mt-12 py-4 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>Tracelog Enterprise Logistics System • Plataforma de Administración Central de Envíos</p>
      </footer>
    </div>
  );
};
