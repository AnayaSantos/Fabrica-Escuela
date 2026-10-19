export function obtenerFechaActualISO(): string {
	const hoy = new Date();
	const mes = String(hoy.getMonth() + 1).padStart(2, '0');
	const dia = String(hoy.getDate()).padStart(2, '0');

	return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function esFechaEstimadaValida(
	fecha: string,
	fechaMinima = obtenerFechaActualISO(),
): boolean {
	return !fecha || fecha >= fechaMinima;
}

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
