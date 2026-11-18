import { CalendarDays, Clock3, Hash, ListOrdered } from 'lucide-react';
import { formatearFechaEstimada } from '@tracelog/hu-15/fecha-estimada';
import { AlertaTiempoEntrega } from '@tracelog/hu-19';
import type { DatosGuia, EventoLogistico } from '../types';
import { InsigniaEstado } from './InsigniaEstado';
import { formatearMovimiento } from './formatoMovimientos';

interface ResumenEnvioProps {
  numeroGuia: string;
  eventos: EventoLogistico[];
  resumen: DatosGuia | null;
}

export function ResumenEnvio({ numeroGuia, eventos, resumen }: ResumenEnvioProps) {
  const primero = eventos[0];
  const ultimo = eventos[eventos.length - 1];

  return (
    <section aria-labelledby="resumen-heading" className="space-y-4">
      <h2 id="resumen-heading" className="sr-only">Resumen del envío</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <p className="flex items-center gap-2 text-sm">
          <Hash size={17} aria-hidden="true" style={{ color: 'var(--tracelog-primary)' }} />
          <span><strong>Número de guía:</strong> {numeroGuia}</span>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <ListOrdered size={17} aria-hidden="true" style={{ color: 'var(--tracelog-primary)' }} />
          <span><strong>Movimientos:</strong> {eventos.length}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">Estado actual:</span>
        {ultimo && <InsigniaEstado estado={ultimo.estado} actual />}
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        {primero && (
          <p className="flex items-center gap-2">
            <Clock3 size={16} aria-hidden="true" style={{ color: 'var(--tracelog-muted)' }} />
            <span><strong>Primer movimiento:</strong> {formatearMovimiento(primero.timestamp)}</span>
          </p>
        )}
        {ultimo && (
          <p className="flex items-center gap-2">
            <Clock3 size={16} aria-hidden="true" style={{ color: 'var(--tracelog-muted)' }} />
            <span><strong>Último movimiento:</strong> {formatearMovimiento(ultimo.timestamp)}</span>
          </p>
        )}
      </div>
      {resumen?.fechaEstimadaEntrega && (
        <p className="flex items-center gap-2 text-sm">
          <CalendarDays size={16} aria-hidden="true" style={{ color: 'var(--tracelog-accent)' }} />
          <span><strong>Entrega estimada:</strong> {formatearFechaEstimada(resumen.fechaEstimadaEntrega)}</span>
        </p>
      )}
      {resumen?.alertaTiempo && <AlertaTiempoEntrega estado={resumen.alertaTiempo} />}
    </section>
  );
}
