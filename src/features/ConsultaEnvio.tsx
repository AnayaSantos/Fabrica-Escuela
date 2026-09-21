import { useEffect, useState, type FormEvent } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { consultarGuia } from "../services/shipmentService";
import type { DatosGuia, EnvioRecord, EstadoConsulta } from "../types";

interface ConsultaEnvioProps {
  envios: EnvioRecord[];
  selectedGuide: string;
  onSelectGuide: (numeroGuia: string) => void;
}

export function ConsultaEnvio({ envios, selectedGuide, onSelectGuide }: ConsultaEnvioProps) {
  const [numeroGuia, setNumeroGuia] = useState(selectedGuide);
  const [estadoConsulta, setEstadoConsulta] = useState<EstadoConsulta>("IDLE");
  const [cargando, setCargando] = useState(false);
  const [datos, setDatos] = useState<DatosGuia | null>(null);

  useEffect(() => {
    if (selectedGuide) {
      setNumeroGuia(selectedGuide);
    }
  }, [selectedGuide]);

  async function handleConsultar(event: FormEvent) {
    event.preventDefault();
    const codigo = numeroGuia.trim();
    if (!codigo) {
      return;
    }

    setCargando(true);
    setEstadoConsulta("IDLE");

    try {
      const resultado = await consultarGuia(codigo);
      setDatos(resultado);
      setEstadoConsulta("EXITO");
      onSelectGuide(resultado.numeroGuia);
    } catch {
      setDatos(null);
      setEstadoConsulta("ERROR");
    } finally {
      setCargando(false);
    }
  }

  return (
    <article className="feature-content compact">
      <header className="feature-heading centered">
        <p className="eyebrow">HU-02</p>
        <h2>Consultar envío</h2>
      </header>

      <form className="lookup-form" onSubmit={handleConsultar}>
        <label className="field">
          <span>No. de guía</span>
          <input
            value={numeroGuia}
            onChange={(event) => {
              setNumeroGuia(event.target.value);
              if (estadoConsulta === "ERROR") {
                setEstadoConsulta("IDLE");
              }
            }}
            className={estadoConsulta === "ERROR" ? "input-error" : ""}
            placeholder="LG-2026-00000001"
          />
        </label>
        <button className="primary-button" type="submit" disabled={cargando}>
          {cargando ? "Consultando..." : "Consultar"}
        </button>
      </form>

      <div className="quick-guides" aria-label="Guías disponibles">
        {envios.slice(0, 5).map((envio) => (
          <button
            key={envio.numeroGuia}
            type="button"
            onClick={() => {
              setNumeroGuia(envio.numeroGuia);
              onSelectGuide(envio.numeroGuia);
            }}
          >
            {envio.numeroGuia}
          </button>
        ))}
      </div>

      {estadoConsulta === "EXITO" && datos && (
        <section className="result-panel">
          <div className="result-header">
            <div>
              <p className="muted-label">Guía encontrada</p>
              <h3>{datos.numeroGuia}</h3>
            </div>
            <StatusBadge estado={datos.estadoActual} />
          </div>

          <dl className="details-grid">
            <div>
              <dt>Remitente</dt>
              <dd>{datos.remitente}</dd>
            </div>
            <div>
              <dt>Destinatario</dt>
              <dd>{datos.destinatario}</dd>
            </div>
            <div>
              <dt>Origen</dt>
              <dd>{datos.origen}</dd>
            </div>
            <div>
              <dt>Destino</dt>
              <dd>{datos.destino}</dd>
            </div>
          </dl>

          <ol className="timeline">
            {datos.eventos.map((evento) => (
              <li key={`${evento.titulo}-${evento.fechaHora}`} className={evento.completado ? "done" : ""}>
                <span aria-hidden="true" />
                <div>
                  <strong>{evento.titulo}</strong>
                  <p>{evento.fechaHora}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {estadoConsulta === "ERROR" && (
        <div className="alert error center">Número de guía inexistente, intenta con otro.</div>
      )}
    </article>
  );
}
