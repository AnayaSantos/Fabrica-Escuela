import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  CAMPOS_OBLIGATORIOS,
  CAMPOS_VACIOS,
  type EnvioFormData,
  type VistaFormulario,
} from "../types/envio";
import { registrarEnvio } from "../services/envioService";
import { Campo } from "./Campo";
import {
  esFechaEstimadaValida,
  obtenerFechaActualISO,
} from "@tracelog/hu-15/fecha-estimada";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function RegistrarEnvio() {
  const [form, setForm] = useState<EnvioFormData>(CAMPOS_VACIOS);
  const [vista, setVista] = useState<VistaFormulario>("formulario");
  const [numeroGuia, setNumeroGuia] = useState<string>("");
  const [enviando, setEnviando] = useState<boolean>(false);
  const fechaMinima = obtenerFechaActualISO();
  const fechaEstimadaPasada = Boolean(form.fechaEstimadaEntrega) &&
    !esFechaEstimadaValida(form.fechaEstimadaEntrega, fechaMinima);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function camposFaltantes(): (keyof EnvioFormData)[] {
    return CAMPOS_OBLIGATORIOS.filter((campo) => form[campo].trim() === "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (camposFaltantes().length > 0 || fechaEstimadaPasada) {
      setVista("errores");
      return;
    }

    try {
      setEnviando(true);
      const respuesta = await registrarEnvio(form);
      setNumeroGuia(respuesta.numeroGuia);
      setVista("exito");
    } catch (error) {
      // En un caso real, aquí se mostraría un estado de error de servidor,
      // distinto del error de validación de campos.
      console.error(error);
      alert("Ocurrió un error al registrar el envío. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function handleNuevoRegistro() {
    setForm(CAMPOS_VACIOS);
    setVista("formulario");
    setNumeroGuia("");
  }

  const faltantes = camposFaltantes();
  const esError = (campo: keyof EnvioFormData) =>
    vista === "errores" && (
      faltantes.includes(campo) ||
      (campo === "fechaEstimadaEntrega" && fechaEstimadaPasada)
    );

  // --------------------------------------------------------------------
  // VISTA: HU01-Exito
  // --------------------------------------------------------------------
  if (vista === "exito") {
    return (
      <div style={contenedorPagina}>
        <div style={tarjeta}>
          <h1 style={titulo}>Registrar Nuevo Envío</h1>
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: 6,
              padding: "24px 20px",
              textAlign: "center",
              margin: "24px 0",
            }}
          >
            <p style={{ color: "#166534", fontWeight: 600, marginBottom: 12 }}>
              ¡Registro de Envío Exitoso!
            </p>
            <p style={{ color: "#166534", marginBottom: 20 }}>
              Número de Guía Asignado: <strong>{numeroGuia}</strong>
            </p>
            <button onClick={handleNuevoRegistro} style={botonPrimario}>
              Aceptar
            </button>
          </div>
          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            Registrar Nuevo Envío
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------
  // VISTA: HU01-Formulario / HU01-Errores (comparten la misma estructura)
  // --------------------------------------------------------------------
  return (
    <div style={contenedorPagina}>
      {/* Reseteo local: neutraliza el tema oscuro que trae por defecto
          src/index.css de la plantilla de Vite, para que el color y el
          fondo de este formulario no dependan de esos estilos globales. */}
      <style>{`
        input, select {
          color: #111 !important;
        }
        input::placeholder {
          color: #999;
        }
      `}</style>
      <div style={tarjeta}>
        <h1 style={titulo}>Registrar Nuevo Envío</h1>

        {vista === "errores" && (
          <p
            style={{
              color: "#dc2626",
              fontSize: 13,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {fechaEstimadaPasada
              ? "La fecha estimada de entrega no puede estar en el pasado."
              : "Error al guardar: Por favor, completa los campos obligatorios resaltados en rojo."}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={grid2col}>
            <Campo
              etiqueta="Nombre del remitente"
              name="nombreRemitente"
              value={form.nombreRemitente}
              tieneError={esError("nombreRemitente")}
              onChange={handleChange}
            />
            <Campo
              etiqueta="Nombre del destinatario"
              name="nombreDestinatario"
              value={form.nombreDestinatario}
              tieneError={esError("nombreDestinatario")}
              onChange={handleChange}
            />

            <Campo
              etiqueta="Documento de identificación"
              name="documentoRemitente"
              value={form.documentoRemitente}
              tieneError={esError("documentoRemitente")}
              onChange={handleChange}
            />
            <Campo
              etiqueta="Documento de identificación"
              name="documentoDestinatario"
              value={form.documentoDestinatario}
              tieneError={esError("documentoDestinatario")}
              onChange={handleChange}
            />

            <Campo
              etiqueta="Teléfono"
              name="telefonoRemitente"
              value={form.telefonoRemitente}
              tieneError={esError("telefonoRemitente")}
              onChange={handleChange}
            />
            <Campo
              etiqueta="Teléfono"
              name="telefonoDestinatario"
              value={form.telefonoDestinatario}
              tieneError={esError("telefonoDestinatario")}
              onChange={handleChange}
            />

            <Campo
              etiqueta="Dirección de origen"
              name="direccionOrigen"
              value={form.direccionOrigen}
              tieneError={esError("direccionOrigen")}
              onChange={handleChange}
            />
            <Campo
              etiqueta="Dirección de destino"
              name="direccionDestino"
              value={form.direccionDestino}
              tieneError={esError("direccionDestino")}
              onChange={handleChange}
            />

            <Campo
              etiqueta="Ciudad de origen"
              name="ciudadOrigen"
              value={form.ciudadOrigen}
              tieneError={esError("ciudadOrigen")}
              onChange={handleChange}
            />
            <Campo
              etiqueta="Ciudad de destino"
              name="ciudadDestino"
              value={form.ciudadDestino}
              tieneError={esError("ciudadDestino")}
              onChange={handleChange}
            />
          </div>

          <p style={{ fontSize: 13, color: "#555", margin: "8px 0 12px" }}>
            Detalles del Paquete y Servicio
          </p>

          <div style={grid3col}>
            <Campo
              etiqueta="Peso (kg)"
              name="peso"
              type="number"
              value={form.peso}
              tieneError={esError("peso")}
              onChange={handleChange}
            />
            <Campo
              etiqueta="Tipo de servicio"
              name="tipoServicio"
              value={form.tipoServicio}
              tieneError={esError("tipoServicio")}
              onChange={handleChange}
              opciones={[
                { label: "Estándar", value: "ESTANDAR" },
                { label: "Express", value: "EXPRESS" },
              ]}
            />
            <Campo
              etiqueta="Fecha estimada de entrega"
              name="fechaEstimadaEntrega"
              type="date"
              min={fechaMinima}
              value={form.fechaEstimadaEntrega}
              tieneError={esError("fechaEstimadaEntrega")}
              onChange={handleChange}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button type="submit" disabled={enviando} style={botonPrimario}>
              {enviando ? "Registrando..." : "Registrar envío."}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// ESTILOS (extraídos como objetos para mantener el JSX legible)
// ============================================================================
const contenedorPagina: React.CSSProperties = {
  minHeight: "100vh",
  background: "#fff",
  padding: "40px 16px",
  fontFamily: "sans-serif",
};

const tarjeta: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "32px 40px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const titulo: React.CSSProperties = {
  textAlign: "center",
  fontSize: 20,
  fontWeight: 600,
  color: "#111",
  marginBottom: 24,
};

const grid2col: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: 32,
};

const grid3col: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  columnGap: 24,
};

const botonPrimario: React.CSSProperties = {
  background: "#1d4ed8",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "10px 28px",
  fontSize: 14,
  cursor: "pointer",
};
