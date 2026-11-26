import React, { useEffect, useState } from 'react';
import type { CentroDistribucion, RutaTransporte } from '../types/ruta';
import { registrarRutaService } from '../services/registrarRutaService';

export const RegistrarRutaForm: React.FC = () => {
    const [centros, setCentros] = useState<CentroDistribucion[]>([]);
    const [cargandoCentros, setCargandoCentros] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [errorServicio, setErrorServicio] = useState('');
    const [nombreRuta, setNombreRuta] = useState('');
    const [origenId, setOrigenId] = useState('');
    const [destinoId, setDestinoId] = useState('');
    const [paradasIntermedias, setParadasIntermedias] = useState<string[]>([]);
    const [mensajeExito, setMensajeExito] = useState(false);

    const esInconsistente = origenId !== '' && destinoId !== '' && origenId === destinoId;
    const formularioValido = nombreRuta.trim() !== '' && origenId !== '' && destinoId !== '' && !esInconsistente;

    useEffect(() => {
        let activo = true;
        registrarRutaService.obtenerCentros()
            .then((centrosDisponibles) => {
                if (activo) setCentros(centrosDisponibles);
            })
            .catch((error: unknown) => {
                if (activo) setErrorServicio(error instanceof Error ? error.message : 'No se pudieron cargar los centros.');
            })
            .finally(() => {
                if (activo) setCargandoCentros(false);
            });

        return () => {
            activo = false;
        };
    }, []);

    const agregarParada = () => {
        setParadasIntermedias([...paradasIntermedias, '']);
    };

    const cambiarParada = (index: number, value: string) => {
        const nuevasParadas = [...paradasIntermedias];
        nuevasParadas[index] = value;
        setParadasIntermedias(nuevasParadas);
    };

    const eliminarParada = (index: number) => {
        setParadasIntermedias(paradasIntermedias.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formularioValido) return;

        const nuevaRuta: RutaTransporte = {
            nombreRuta,
            origenId,
            destinoId,
            paradasIntermediasIds: paradasIntermedias.filter((p) => p !== ''),
        };

        setGuardando(true);
        setErrorServicio('');
        setMensajeExito(false);
        try {
            await registrarRutaService.registrarRuta(nuevaRuta);
            setMensajeExito(true);
            setNombreRuta('');
            setOrigenId('');
            setDestinoId('');
            setParadasIntermedias([]);
        } catch (error: unknown) {
            setErrorServicio(error instanceof Error ? error.message : 'No se pudo registrar la ruta.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
            {/* Encabezado Superior */}
            <div style={{ marginBottom: '20px' }}>

                <h1 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#0f172a' }}>Gestión de Rutas</h1>
            </div>

            {/* Tarjeta Principal de Formulario */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '22px', color: '#0f172a' }}>Registrar nueva ruta de transporte</h2>

                {mensajeExito && (
                    <div style={{ padding: '12px 16px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bbf7d0', fontSize: '14px', fontWeight: '500' }}>
                        ✓ Ruta registrada exitosamente en el sistema.
                    </div>
                )}
                {errorServicio && (
                    <div role="alert" style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca', fontSize: '14px' }}>
                        {errorServicio}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Fila 1: Nombre de la Ruta */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
                            Nombre de la ruta *
                        </label>
                        <input
                            type="text"
                            value={nombreRuta}
                            onChange={(e) => setNombreRuta(e.target.value)}
                            placeholder="Ej. Ruta Troncal Bogotá - Medellín"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        />
                    </div>

                    {/* Fila 2: Origen y Destino */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        {/* Columna Origen */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#0f172a' }}>Origen</h3>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
                                Centro de distribución de origen *
                            </label>
                            <select
                                value={origenId}
                                onChange={(e) => setOrigenId(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                            >
                                <option value="">Selecciona una opción</option>
                                {centros.map((centro) => (
                                    <option key={centro.id} value={centro.id}>
                                        {centro.nombre} ({centro.ciudad})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Columna Destino */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#0f172a' }}>Destino</h3>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
                                Centro de distribución de destino *
                            </label>
                            <select
                                value={destinoId}
                                onChange={(e) => setDestinoId(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                            >
                                <option value="">Selecciona una opción</option>
                                {centros.map((centro) => (
                                    <option key={centro.id} value={centro.id}>
                                        {centro.nombre} ({centro.ciudad})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Mensaje de Inconsistencia */}
                    {esInconsistente && (
                        <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fecaca', fontSize: '13px' }}>
                            ⚠️ El origen y el destino no pueden ser el mismo centro de distribución.
                        </div>
                    )}

                    {/* Fila 3: Paradas Intermedias */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0f172a' }}>Paradas intermedias (Opcional)</h3>

                        {paradasIntermedias.map((paradaId, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <select
                                    value={paradaId}
                                    onChange={(e) => cambiarParada(index, e.target.value)}
                                    style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}
                                >
                                    <option value="">Selecciona parada {index + 1}</option>
                                    {centros.map((centro) => (
                                        <option key={centro.id} value={centro.id}>
                                            {centro.nombre} ({centro.ciudad})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => eliminarParada(index)}
                                    style={{ padding: '0 16px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                                >
                                    Quitar
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={agregarParada}
                            style={{ marginTop: '5px', padding: '8px 14px', backgroundColor: '#ffffff', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                        >
                            + Agregar parada intermedia
                        </button>
                    </div>

                    {/* Botón de envío */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            disabled={!formularioValido || cargandoCentros || guardando || centros.length === 0}
                            style={{
                                padding: '12px 28px',
                                backgroundColor: formularioValido && !cargandoCentros && !guardando && centros.length > 0 ? '#2563eb' : '#94a3b8',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: formularioValido && !cargandoCentros && !guardando && centros.length > 0 ? 'pointer' : 'not-allowed',
                                boxShadow: formularioValido && !cargandoCentros && !guardando && centros.length > 0 ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
                            }}
                        >
                            {cargandoCentros ? 'Cargando centros...' : guardando ? 'Registrando...' : 'Registrar ruta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};