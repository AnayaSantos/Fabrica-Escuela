export interface CentroDistribucion {
    id: string;
    nombre: string;
    ciudad: string;
}

export interface RutaTransporte {
    id?: string;
    nombreRuta: string;
    origenId: string;
    destinoId: string;
    paradasIntermediasIds: string[];
}