import { MapPin } from 'lucide-react';
import type { EventoLogistico } from '../types';
import { formatearMovimiento } from './formatoMovimientos';
import { InsigniaEstado } from './InsigniaEstado';

interface LineaTiempoMovimientosProps {
  eventos: EventoLogistico[];
}

export function LineaTiempoMovimientos({ eventos }: LineaTiempoMovimientosProps) {
  return (
    <ol className="relative mt-6 space-y-6 border-l pl-5 sm:pl-7" style={{ borderColor: 'var(--tracelog-border)' }}>
      {eventos.map((evento, index) => {
        const actual = index === eventos.length - 1;
        const fecha = new Date(evento.timestamp);
        return (
          <li key={evento.id} className="relative">
            <span
              className="absolute -left-[30px] top-1 h-3 w-3 rounded-full border-2 sm:-left-[38px]"
              style={{
                borderColor: actual ? 'var(--tracelog-accent)' : 'var(--tracelog-border)',
                backgroundColor: actual ? 'var(--tracelog-accent)' : 'var(--tracelog-surface)',
              }}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center gap-2">
              <InsigniaEstado estado={evento.estado} actual={actual} />
              {actual && <span className="text-xs font-semibold" style={{ color: 'var(--tracelog-accent)' }}>Estado actual</span>}
            </div>
            <time className="mt-2 block text-sm font-medium" dateTime={fecha.toISOString()}>
              {formatearMovimiento(evento.timestamp)}
            </time>
            <p className="mt-1 flex items-start gap-2 text-sm">
              <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" style={{ color: 'var(--tracelog-primary)' }} />
              <span><strong>Ubicación:</strong> {evento.ubicacion}</span>
            </p>
            {evento.detalle && <p className="mt-1 text-sm" style={{ color: 'var(--tracelog-muted)' }}>{evento.detalle}</p>}
          </li>
        );
      })}
    </ol>
  );
}
