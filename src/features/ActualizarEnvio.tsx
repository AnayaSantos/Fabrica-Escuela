import { useEffect, useState, type FormEvent } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { actualizarEstadoEnvio } from "../services/shipmentService";
import type { EnvioRecord, EstadoEnvio } from "../types";
import {
  ESTADOS_ENVIO,
  getTransicionesPermitidas,
  normalizeEstadoEnvio,
} from "../utils/estadoEnvio";

interface ActualizarEnvioProps {
  envios: EnvioRecord[];
  selectedGuide: string;
  onSelectGuide: (numeroGuia: string) => void;
  onUpdated: (numeroGuia: string) => void;
}

export function ActualizarEnvio({
  envios,
  selectedGuide,
  onSelectGuide,
  onUpdated,
}: ActualizarEnvioProps) {
  const [numeroGuia, setNumeroGuia] = useState(selectedGuide);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoEnvio | "">("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedGuide) {
      setNumeroGuia(selectedGuide);
    }
  }, [selectedGuide]);

  const envioActual = envios.find((envio) => envio.numeroGuia === numeroGuia);
  const estadoActual = normalizeEstadoEnvio(envioActual?.estadoActual);
  const permitidos = getTransicionesPermitidas(envioActual?.estadoActual);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!envioActual) {
      setMessage({ type: "error", text: "No se encontró la guía seleccionada." });
      return;
    }

    if (!estadoSeleccionado) {
      setMessage({ type: "error", text: "Selecciona un estado antes de continuar." });
      return;
    }

    const estadoNormalizado = normalizeEstadoEnvio(estadoSeleccionado);
    if (!estadoNormalizado || !permitidos.includes(estadoNormalizado)) {
      setMessage({
        type: "error",
        text: "El estado seleccionado no es válido para el estado actual.",
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await actualizarEstadoEnvio(numeroGuia, estadoNormalizado);
      if (!updated) {
        setMessage({ type: "error", text: "No se pudo actualizar el envío." });
        return;
      }

      setEstadoSeleccionado("");
      setMessage({
        type: "success",
        text: `Envío actualizado correctamente a ${estadoNormalizado}.`,
      });
      onUpdated(updated.numeroGuia);
    } catch {
      setMessage({ type: "error", text: "No se pudo actualizar el envío." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="feature-content compact">
      <header className="feature-heading centered">
        <p className="eyebrow">HU-03</p>
        <h2>Actualización de envío</h2>
      </header>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Envío No.</span>
          <select
            value={numeroGuia}
            onChange={(event) => {
              setNumeroGuia(event.target.value);
              onSelectGuide(event.target.value);
              setMessage(null);
              setEstadoSeleccionado("");
            }}
          >
            {envios.map((envio) => (
              <option key={envio.numeroGuia} value={envio.numeroGuia}>
                {envio.numeroGuia}
              </option>
            ))}
          </select>
        </label>

        <div className="state-display">
          <span>Estado actual</span>
          {estadoActual ? <StatusBadge estado={estadoActual} /> : <strong>Sin datos</strong>}
        </div>

        <label className="field">
          <span>Selecciona un nuevo estado</span>
          <select
            value={estadoSeleccionado}
            onChange={(event) => setEstadoSeleccionado(event.target.value as EstadoEnvio)}
          >
            <option value="">Seleccionar</option>
            {ESTADOS_ENVIO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </label>

        {envioActual && (
          <div className="helper-box">
            Transiciones permitidas: {permitidos.length > 0 ? permitidos.join(", ") : "sin cambios permitidos"}
          </div>
        )}

        {message && <div className={`alert ${message.type}`}>{message.text}</div>}

        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "Actualizando..." : "Actualizar envío"}
        </button>
      </form>
    </article>
  );
}
