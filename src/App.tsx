import { useEffect, useState } from "react";
import { ActualizarEnvio } from "./features/ActualizarEnvio";
import { ConsultaEnvio } from "./features/ConsultaEnvio";
import { HistorialEventos } from "./features/HistorialEventos";
import { RegistrarEnvio } from "./features/RegistrarEnvio";
import { initializeStore, listEnvios } from "./services/shipmentService";
import type { EnvioRecord, FeatureId } from "./types";

const FEATURES: { id: FeatureId; hu: string; label: string }[] = [
  { id: "registro", hu: "HU-01", label: "Registrar" },
  { id: "consulta", hu: "HU-02", label: "Consultar" },
  { id: "actualizacion", hu: "HU-03", label: "Actualizar" },
  { id: "historial", hu: "HU-04", label: "Historial" },
];

function App() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>("registro");
  const [envios, setEnvios] = useState<EnvioRecord[]>([]);
  const [selectedGuide, setSelectedGuide] = useState("");
  const [loadingEnvios, setLoadingEnvios] = useState(true);
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        await initializeStore();
        const initialEnvios = await listEnvios();

        if (!isMounted) {
          return;
        }

        setEnvios(initialEnvios);
        setSelectedGuide(initialEnvios[0]?.numeroGuia ?? "");
      } catch {
        if (isMounted) {
          setGlobalError("No se pudieron cargar los envíos.");
        }
      } finally {
        if (isMounted) {
          setLoadingEnvios(false);
        }
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshEnvios(nextGuide?: string) {
    try {
      const updatedEnvios = await listEnvios();
      setEnvios(updatedEnvios);
      setGlobalError("");

      if (nextGuide) {
        setSelectedGuide(nextGuide);
        return;
      }

      const guideStillExists = updatedEnvios.some((envio) => envio.numeroGuia === selectedGuide);
      if (!guideStillExists) {
        setSelectedGuide(updatedEnvios[0]?.numeroGuia ?? "");
      }
    } catch {
      setGlobalError("No se pudo sincronizar la información de envíos.");
    }
  }

  const selectedEnvio = envios.find((envio) => envio.numeroGuia === selectedGuide) ?? envios[0];

  return (
    <main className="app-shell">
      <section className="app-header">
        <div>
          <p className="eyebrow">Frontend unificado</p>
          <h1>Gestión de envíos</h1>
        </div>
        <div className="summary-strip" aria-label="Resumen de datos locales">
          <span>
            <strong>{envios.length}</strong>
            envíos
          </span>
          <span>
            <strong>{selectedEnvio?.numeroGuia ?? "Sin guía"}</strong>
            guía activa
          </span>
        </div>
      </section>

      {globalError && <div className="alert error">{globalError}</div>}

      <section className="workspace">
        <aside className="sidebar" aria-label="Historias de usuario">
          {FEATURES.map((feature) => (
            <button
              key={feature.id}
              type="button"
              className={`nav-item ${activeFeature === feature.id ? "active" : ""}`}
              onClick={() => setActiveFeature(feature.id)}
            >
              <span>{feature.hu}</span>
              {feature.label}
            </button>
          ))}
        </aside>

        <section className="feature-panel" aria-live="polite">
          {activeFeature === "registro" && (
            <RegistrarEnvio
              onRegistered={(numeroGuia) => {
                void refreshEnvios(numeroGuia);
              }}
            />
          )}

          {activeFeature === "consulta" && (
            <ConsultaEnvio
              envios={envios}
              selectedGuide={selectedGuide}
              onSelectGuide={setSelectedGuide}
            />
          )}

          {activeFeature === "actualizacion" && (
            <ActualizarEnvio
              envios={envios}
              selectedGuide={selectedGuide}
              onSelectGuide={setSelectedGuide}
              onUpdated={(numeroGuia) => void refreshEnvios(numeroGuia)}
            />
          )}

          {activeFeature === "historial" && (
            <HistorialEventos
              envios={envios}
              selectedGuide={selectedGuide}
              onSelectGuide={setSelectedGuide}
              onChanged={(numeroGuia) => void refreshEnvios(numeroGuia)}
            />
          )}

          {loadingEnvios && <div className="feature-content">Cargando envíos...</div>}
        </section>
      </section>
    </main>
  );
}

export default App;
