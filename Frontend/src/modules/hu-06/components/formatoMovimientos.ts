const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatearMovimiento(timestamp: number): string {
  return formatoFecha.format(new Date(timestamp));
}
