import { CheckCircle2, Circle, PackageCheck, Warehouse, Truck } from 'lucide-react';

interface InsigniaEstadoProps {
  estado: string;
  actual?: boolean;
}

const configuracion = {
  CREADO: { icon: Circle, color: 'var(--tracelog-muted)' },
  PREPARANDO: { icon: PackageCheck, color: 'var(--tracelog-muted)' },
  'EN BODEGA': { icon: Warehouse, color: 'var(--tracelog-primary)' },
  'EN TRÁNSITO': { icon: Truck, color: 'var(--tracelog-accent)' },
  ENTREGADO: { icon: CheckCircle2, color: 'var(--tracelog-success)' },
} as const;

export function InsigniaEstado({ estado, actual = false }: InsigniaEstadoProps) {
  const normalized = estado.trim().toUpperCase() as keyof typeof configuracion;
  const selected = configuracion[normalized] ?? configuracion.CREADO;
  const Icon = selected.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{
        color: selected.color,
        borderColor: selected.color,
        backgroundColor: actual ? 'var(--tracelog-surface)' : 'transparent',
      }}
    >
      <Icon size={14} aria-hidden="true" />
      {estado}
      {actual && <span className="sr-only">, estado actual</span>}
    </span>
  );
}
