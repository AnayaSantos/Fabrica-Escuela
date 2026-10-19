import type { EstadoAlertaTiempo } from './components/AlertaTiempoEntrega';

export const GUIA_EJEMPLO = 'EJEMPLO-LG-2026-00000001';
export const FECHA_ESTIMADA_EJEMPLO = '2026-10-15';

export function formatearFechaEstimada(fecha: string): string {
  const fechaUtc = new Date(`${fecha}T00:00:00Z`);

  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(fechaUtc);
}

interface EventoEjemplo {
  titulo: string;
  fechaHora: string;
  completado: boolean;
}

interface DatosGuiaEjemplo {
  numeroGuia: string;
  eventos: EventoEjemplo[];
  alertaTiempo: EstadoAlertaTiempo;
  fechaEstimadaEntrega: string;
}

export const DATOS_GUIA_EJEMPLO: DatosGuiaEjemplo = {
  numeroGuia: GUIA_EJEMPLO,
  eventos: [
    {
      titulo: 'El paquete entró a las instalaciones',
      fechaHora: '01/09/2026 10:41',
      completado: true,
    },
    {
      titulo: 'Salió a ciudad destino',
      fechaHora: '01/09/2026 15:20',
      completado: true,
    },
    {
      titulo: 'En reparto',
      fechaHora: '03/09/2026 12:15',
      completado: true,
    },
    {
      titulo: 'Paquete entregado',
      fechaHora: 'Estimado: 15/10/2026',
      completado: false,
    },
  ],
  alertaTiempo: 'delayed_1_day',
  fechaEstimadaEntrega: FECHA_ESTIMADA_EJEMPLO,
};

export function esGuiaEjemplo(guia: string): boolean {
  return guia.trim().toUpperCase() === GUIA_EJEMPLO;
}
