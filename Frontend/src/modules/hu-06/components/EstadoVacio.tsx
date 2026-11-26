import { Inbox } from 'lucide-react';

export function EstadoVacio() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center" role="status">
      <Inbox size={42} aria-hidden="true" style={{ color: 'var(--tracelog-muted)' }} />
      <p style={{ color: 'var(--tracelog-muted)' }}>Este envío aún no tiene movimientos registrados.</p>
    </div>
  );
}
