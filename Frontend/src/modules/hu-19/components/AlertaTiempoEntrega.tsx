import {
  CloudLightning,
  CloudOff,
  CloudRain,
  Construction,
  Map,
  MinusCircle,
  Sun,
  type LucideIcon,
} from 'lucide-react';

export type EstadoAlertaTiempo =
  | 'on_time'
  | 'early'
  | 'delayed_1_day'
  | 'delayed_2_days'
  | 'api_error';

interface ConfiguracionAlerta {
  titulo: string;
  descripcion?: string;
  iconos?: LucideIcon[];
  clases: string;
}

const alertas: Record<EstadoAlertaTiempo, ConfiguracionAlerta> = {
  on_time: {
    titulo: 'El envío avanza según lo programado',
    clases: 'border-black bg-white text-center',
  },
  early: {
    titulo: '¡Buenas noticias! Tu envío llegará antes.',
    descripcion: 'Llegará 1 día antes de lo estimado debido al buen clima y a una ruta despejada.',
    iconos: [Sun, Map],
    clases: 'border-green-600 bg-[#7cfc00]',
  },
  delayed_1_day: {
    titulo: 'Posible retraso en la ruta.',
    descripcion: 'Estimamos 1 día de retraso debido al mal clima y a la congestión en la vía.',
    iconos: [CloudRain, Construction],
    clases: 'border-[#ff7f50] bg-[#ffb38a]',
  },
  delayed_2_days: {
    titulo: 'Retraso significativo.',
    descripcion: 'El envío presenta 2 o más días de retraso por tormentas fuertes y cierre total de la vía.',
    iconos: [CloudLightning, MinusCircle],
    clases: 'border-red-600 bg-[#ff8a8a]',
  },
  api_error: {
    titulo: 'No pudimos obtener los datos del clima y la ruta en este momento. Intenta nuevamente más tarde.',
    iconos: [CloudOff],
    clases: 'border-black bg-[#b3b3b3] text-center',
  },
};

interface AlertaTiempoEntregaProps {
  estado?: EstadoAlertaTiempo | null;
}

export function AlertaTiempoEntrega({ estado }: AlertaTiempoEntregaProps) {
  if (!estado) return null;

  const alerta = alertas[estado];
  const centrada = estado === 'on_time' || estado === 'api_error';

  return (
    <section
      className={`mt-4 mx-auto w-full max-w-md rounded-xl border-2 p-4 shadow-sm ${alerta.clases}`}
      role={estado === 'api_error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className={`flex items-center gap-1.5 ${centrada ? 'justify-center' : ''}`}>
        {alerta.iconos?.map((Icono, index) => (
          <Icono key={`${estado}-${index}`} className="h-5 w-5 shrink-0 text-black" aria-hidden="true" />
        ))}
        <p className="text-sm font-medium text-black">{alerta.titulo}</p>
      </div>
      {alerta.descripcion && (
        <p className="mt-1 text-left text-sm leading-snug text-black">{alerta.descripcion}</p>
      )}
    </section>
  );
}
