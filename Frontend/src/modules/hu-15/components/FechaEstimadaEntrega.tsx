import React, { useState } from 'react';
import {
  esFechaEstimadaValida,
  formatearFechaEstimada,
  obtenerFechaActualISO,
} from '../utils/fechaEstimada';
import {
  DATOS_GUIA_EJEMPLO,
  esGuiaEjemplo,
  FECHA_ESTIMADA_EJEMPLO,
  GUIA_EJEMPLO,
} from '@tracelog/hu-19/ejemplos';

export function FechaEstimadaEntrega() {
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [modoCliente, setModoCliente] = useState(false);
  const [guia, setGuia] = useState(GUIA_EJEMPLO);
  const [estadoConsultaCliente, setEstadoConsultaCliente] = useState<'IDLE' | 'ENCONTRADO' | 'NO_ENCONTRADO'>('IDLE');

  const hoy = obtenerFechaActualISO();

  const handleConsultarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    setEstadoConsultaCliente(esGuiaEjemplo(guia) ? 'ENCONTRADO' : 'NO_ENCONTRADO');
  };

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);
    setExito(false);

    if (nuevaFecha && !esFechaEstimadaValida(nuevaFecha, hoy)) {
      setError('⚠️ La fecha estimada de entrega no puede estar en el pasado');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha || error) return;
    setExito(true);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Botón para alternar entre vista Registro y vista Cliente (CA-15-C) */}
      <div style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button 
          onClick={() => setModoCliente(!modoCliente)}
          style={{ padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}
        >
          {modoCliente ? 'Ver Formulario Registro (CA-15-A/B)' : 'Ver Consulta Cliente (CA-15-C)'}
        </button>
      </div>

      {!modoCliente ? (
        /* VISTA REGISTRO / FORMULARIO (CA-15-A y CA-15-B) */
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ textAlign: 'center' }}>Registrar Nuevo Envío</h2>
          <p style={{ color: '#666', textAlign: 'center', fontSize: '14px' }}>... (Otros campos del formulario)</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Fecha estimada de entrega:*
              </label>
              <input
                type="date"
                value={fecha}
                onChange={handleFechaChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: error ? '2px solid red' : '1px solid #ccc',
                  outline: 'none'
                }}
              />
              {error && (
                <p style={{ color: 'red', fontSize: '13px', marginTop: '5px' }}>{error}</p>
              )}
            </div>

            {exito && (
              <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                ✅ Fecha estimada asignada correctamente
              </div>
            )}

            <button
              type="submit"
              disabled={!fecha || !!error}
              style={{
                padding: '12px',
                backgroundColor: (!fecha || !!error) ? '#cccccc' : '#1976D2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (!fecha || !!error) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              Registrar Envío
            </button>
          </form>
        </div>
      ) : (
        /* VISTA CONSULTA CLIENTE (CA-15-C) */
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h2>Consultar envío</h2>
          <form onSubmit={handleConsultarCliente}>
            <label htmlFor="guia-consulta-cliente" style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>
              Ingrese el No. de guía
            </label>
            <input
              id="guia-consulta-cliente"
              type="text"
              value={guia}
              onChange={(e) => {
                setGuia(e.target.value);
                setEstadoConsultaCliente('IDLE');
              }}
              placeholder={GUIA_EJEMPLO}
              style={{ padding: '8px', width: '80%', marginBottom: '10px', textAlign: 'center' }}
            />
            <p style={{ color: '#666', fontSize: '11px', margin: '0 0 10px' }}>
              Ejemplo de frontend, sin consulta al backend: {GUIA_EJEMPLO}
            </p>
            <button type="submit" style={{ padding: '6px 16px', borderRadius: '4px', marginBottom: '15px' }}>
              Consultar
            </button>
          </form>

          {estadoConsultaCliente === 'ENCONTRADO' && (
            <>
              <p style={{ color: 'green', fontSize: '13px' }}>No. de guía encontrado con éxito</p>
              <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginTop: '10px' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  Fecha estimada de entrega:<br />
                  <span style={{ color: '#1976D2' }}>{formatearFechaEstimada(FECHA_ESTIMADA_EJEMPLO)}</span>
                </p>
                <div style={{ textAlign: 'left', fontSize: '12px', color: '#555', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  {DATOS_GUIA_EJEMPLO.eventos.map((evento) => (
                    <p key={evento.titulo}>
                      {evento.completado ? '🔵' : '⚪'} {evento.titulo}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}

          {estadoConsultaCliente === 'NO_ENCONTRADO' && (
            <p role="alert" style={{ color: '#b91c1c', fontSize: '13px' }}>
              Esa guía no corresponde al ejemplo local. Esta vista no consulta el backend.
            </p>
          )}
        </div>
      )}
    </div>
  );
}