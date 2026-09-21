import { useEffect, useState, type FormEvent } from "react";
import {
  eliminarEventoLogistico,
  registrarEventoLogistico,
} from "../services/shipmentService";
import type { EnvioRecord, TipoEventoLogistico } from "../types";

interface HistorialEventosProps {
  envios: EnvioRecord[];
  selectedGuide: string;
  onSelectGuide: (numeroGuia: string) => void;
  onChanged: (numeroGuia: string) => void;
}

const TIPOS_EVENTO: TipoEventoLogistico[] = [
  "CREADO",
  "PREPARANDO",
  "EN BODEGA",
  "EN TRÁNSITO",
  "ENTREGADO",
];

function ubicacionValida(ubicacion: string) {
  return /[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]/.test(ubicacion.trim());
}

export function HistorialEventos({
  envios,
  selectedGuide,
  onSelectGuide,
  onChanged,
}: HistorialEventosProps) {
  const [numeroGuia, setNumeroGuia] = useState(selectedGuide);
  const [showForm, setShowForm] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<TipoEventoLogistico | "">("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState("");
  const [nuevoDetalle, setNuevoDetalle] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedGuide) {
      setNumeroGuia(selectedGuide);
    }
  }, [selectedGuide]);

  const envioActual = envios.find((envio) => envio.numeroGuia === numeroGuia);
  const eventos = envioActual?.eventos.slice().sort((a, b) => b.timestamp - a.timestamp) ?? [];

  async function handleGuardarEvento(event: FormEvent) {
    event.preventDefault();

    if (!envioActual) {
      setMessage({ type: "error", text: "No se encontró la guía seleccionada." });
      return;
    }

    if (!nuevoEstado || !ubicacionValida(nuevaUbicacion)) {
      setMessage({
        type: "error",
        text: "El evento no es válido. Selecciona un estado e ingresa una ubicación válida.",
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await registrarEventoLogistico(numeroGuia, {
        estado: nuevoEstado,
        ubicacion: nuevaUbicacion.trim(),
        detalle: nuevoDetalle.trim(),
      });

      if (!updated) {
        setMessage({ type: "error", text: "No se pudo registrar el evento." });
        return;
      }

      setNuevoEstado("");
      setNuevaUbicacion("");
      setNuevoDetalle("");
      setShowForm(false);
      setMessage({ type: "success", text: `Evento registrado en la guía ${updated.numeroGuia}.` });
      onChanged(updated.numeroGuia);
    } catch {
      setMessage({ type: "error", text: "No se pudo registrar el evento." });
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminarEvento(eventoId: string) {
    const updated = await eliminarEventoLogistico(numeroGuia, eventoId);
    if (!updated) {
      setMessage({ type: "error", text: "No se pudo eliminar el evento." });
      return;
    }

    setMessage({ type: "success", text: "Evento eliminado de la bitácora." });
    onChanged(updated.numeroGuia);
  }

  return (
    <article className="feature-content">
      <header className="feature-heading split">
        <div>
          <p className="eyebrow">HU-04</p>
          <h2>Bitácora de eventos</h2>
        </div>
        <button className="secondary-button" type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Ocultar formulario" : "Registrar evento"}
        </button>
      </header>

      <div className="toolbar">
        <label className="field inline">
          <span>Guía</span>
          <select
            value={numeroGuia}
            onChange={(event) => {
              setNumeroGuia(event.target.value);
              onSelectGuide(event.target.value);
              setMessage(null);
            }}
          >
            {envios.map((envio) => (
              <option key={envio.numeroGuia} value={envio.numeroGuia}>
                {envio.numeroGuia}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message && <div className={`alert ${message.type}`}>{message.text}</div>}

      {showForm && (
        <form className="event-form" onSubmit={handleGuardarEvento}>
          <label className="field">
            <span>Estado *</span>
            <select
              value={nuevoEstado}
              onChange={(event) => setNuevoEstado(event.target.value as TipoEventoLogistico)}
            >
              <option value="">Seleccionar estado</option>
              {TIPOS_EVENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Ubicación *</span>
            <input
              value={nuevaUbicacion}
              onChange={(event) => setNuevaUbicacion(event.target.value)}
              placeholder="Centro de Acopio Medellín"
            />
          </label>

          <label className="field">
            <span>Observación</span>
            <input
              value={nuevoDetalle}
              onChange={(event) => setNuevoDetalle(event.target.value)}
              placeholder="Detalle o novedad del envío"
            />
          </label>

          <div className="actions-row">
            <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar evento"}
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th>Detalle</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((evento) => (
              <tr key={evento.id}>
                <td>{evento.fechaHora}</td>
                <td>{evento.estado}</td>
                <td>{evento.ubicacion}</td>
                <td>{evento.detalle}</td>
                <td>
                  <button className="text-button danger" type="button" onClick={() => void handleEliminarEvento(evento.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
