import type { CentroDistribucion, CentroDistribucionInput, RespuestaServicio } from '../types';

const STORAGE_KEY = 'tracelog_centros_distribucion';

// Datos iniciales de prueba (incluye el registro mostrado en las capturas)
export const CENTROS_INICIALES: CentroDistribucion[] = [
  {
    id: 'CD-001',
    codigo: 'MED-01',
    nombre: 'Bodega Central Norte',
    ciudad: 'Medellín',
    direccion: 'Calle 10 # 43A - 12',
    estado: 'Activo',
    paquetesEnTransito: 142,
    fechaCreacion: '2026-09-15 08:30',
    capacidad: '15,000 m³',
    telefono: '+57 (604) 444-1234',
    notas: 'Punto de acopio estratégico para el Valle de Aburrá.',
  },
  {
    id: 'CD-002',
    codigo: 'BOG-01',
    nombre: 'Centro Logístico Fontibón',
    ciudad: 'Bogotá',
    direccion: 'Carrera 100 # 24C - 55',
    estado: 'Activo',
    paquetesEnTransito: 384,
    fechaCreacion: '2026-09-10 11:20',
    capacidad: '32,000 m³',
    telefono: '+57 (601) 745-9800',
    notas: 'Hub nacional principal contiguo al Aeropuerto El Dorado.',
  },
  {
    id: 'CD-003',
    codigo: 'CLO-01',
    nombre: 'Hub Logístico Yumbo',
    ciudad: 'Cali',
    direccion: 'Zona Industrial Autopista Cali-Yumbo Km 3',
    estado: 'Activo',
    paquetesEnTransito: 95,
    fechaCreacion: '2026-09-18 14:15',
    capacidad: '18,500 m³',
    telefono: '+57 (602) 667-2200',
    notas: 'Punto de conexión hacia el puerto de Buenaventura.',
  },
  {
    id: 'CD-004',
    codigo: 'BAQ-01',
    nombre: 'Terminal de Carga Caribe',
    ciudad: 'Barranquilla',
    direccion: 'Vía 40 # 73 - 290',
    estado: 'Activo',
    paquetesEnTransito: 67,
    fechaCreacion: '2026-09-22 09:45',
    capacidad: '12,000 m³',
    telefono: '+57 (605) 350-4100',
    notas: 'Operaciones para la costa atlántica.',
  },
];

export const CIUDADES_COLOMBIA: string[] = [
  'Medellín',
  'Bogotá',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
  'Manizales',
  'Santa Marta',
  'Cúcuta',
  'Ibagué',
  'Pasto',
  'Villavicencio',
  'Armenia',
  'Montería',
  'Valledupar',
  'Neiva',
  'Popayán',
  'Sincelejo',
  'Tunja',
];

/**
 * Normaliza cadenas de texto para comparaciones consistentes
 */
const normalizar = (texto: string): string =>
  texto.trim().toLowerCase().replace(/\s+/g, ' ');

class CentroDistribucionService {
  /**
   * Obtiene la lista actual de centros de distribución
   * GET /api/centros-distribucion
   */
  public obtenerCentros(): CentroDistribucion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.guardarCentros(CENTROS_INICIALES);
        return CENTROS_INICIALES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error al leer centros desde almacenamiento', e);
      return CENTROS_INICIALES;
    }
  }

  /**
   * Registra un nuevo centro de distribución validando obligatoriedad y duplicidad
   * POST /api/centros-distribucion
   */
  public registrarCentro(
    input: CentroDistribucionInput
  ): RespuestaServicio<CentroDistribucion> {
    const { nombre, ciudad, direccion } = input;

    // Validación CA-13-C: Campos obligatorios
    if (!nombre || !nombre.trim()) {
      return {
        exito: false,
        codigoEstado: 400,
        mensaje: 'Este campo es obligatorio',
        campoFaltante: 'nombre',
      };
    }

    if (!ciudad || !ciudad.trim() || ciudad === 'Seleccionar ciudad') {
      return {
        exito: false,
        codigoEstado: 400,
        mensaje: 'Este campo es obligatorio',
        campoFaltante: 'ciudad',
      };
    }

    if (!direccion || !direccion.trim()) {
      return {
        exito: false,
        codigoEstado: 400,
        mensaje: 'Este campo es obligatorio',
        campoFaltante: 'direccion',
      };
    }

    const centrosActuales = this.obtenerCentros();

    // Validación CA-13-B: Centro de distribución duplicado
    // "Cuando ingreso un nombre y dirección que ya se encuentran registrados en la misma ciudad"
    const existeDuplicado = centrosActuales.some((c) => {
      const mismaCiudad = normalizar(c.ciudad) === normalizar(ciudad);
      const mismoNombre = normalizar(c.nombre) === normalizar(nombre);
      const mismaDireccion = normalizar(c.direccion) === normalizar(direccion);
      return mismaCiudad && mismoNombre && mismaDireccion;
    });

    if (existeDuplicado) {
      return {
        exito: false,
        codigoEstado: 409,
        mensaje: 'Ya existe un centro de distribución con estos datos en la ciudad seleccionada.',
      };
    }

    // Éxito CA-13-A: Generar y almacenar nuevo registro
    const prefijoCiudad = ciudad.substring(0, 3).toUpperCase();
    const correlativoCiudad =
      centrosActuales.filter((c) => normalizar(c.ciudad) === normalizar(ciudad)).length + 1;
    const nuevoCodigo = `${prefijoCiudad}-${String(correlativoCiudad).padStart(2, '0')}`;
    const nuevoId = `CD-${String(centrosActuales.length + 1).padStart(3, '0')}`;

    const nuevoCentro: CentroDistribucion = {
      id: nuevoId,
      codigo: nuevoCodigo,
      nombre: nombre.trim(),
      ciudad: ciudad.trim(),
      direccion: direccion.trim(),
      estado: 'Activo',
      paquetesEnTransito: 0,
      fechaCreacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
      capacidad: '10,000 m³',
      notas: 'Centro de distribución registrado por el Administrador del Sistema.',
    };

    const nuevaLista = [nuevoCentro, ...centrosActuales];
    this.guardarCentros(nuevaLista);

    return {
      exito: true,
      codigoEstado: 201,
      mensaje: 'Centro de distribución registrado correctamente.',
      datos: nuevoCentro,
    };
  }

  /**
   * Elimina un centro de distribución
   * DELETE /api/centros-distribucion/:id
   */
  public eliminarCentro(id: string): CentroDistribucion[] {
    const centros = this.obtenerCentros().filter((c) => c.id !== id);
    this.guardarCentros(centros);
    return centros;
  }

  /**
   * Restablece los datos de prueba iniciales
   */
  public restablecer(): CentroDistribucion[] {
    this.guardarCentros(CENTROS_INICIALES);
    return CENTROS_INICIALES;
  }

  private guardarCentros(centros: CentroDistribucion[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(centros));
    } catch (e) {
      console.error('Error al guardar en almacenamiento', e);
    }
  }
}

export const centroDistribucionService = new CentroDistribucionService();
