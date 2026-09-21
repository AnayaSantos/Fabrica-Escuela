import { useState, type ChangeEvent, type FormEvent } from "react";
import { registrarEnvio } from "../services/shipmentService";
import type { EnvioFormData } from "../types";

interface RegistrarEnvioProps {
  onRegistered: (numeroGuia: string) => void;
}

type InputName = keyof EnvioFormData;

const CAMPOS_VACIOS: EnvioFormData = {
  nombreRemitente: "",
  documentoRemitente: "",
  telefonoRemitente: "",
  direccionOrigen: "",
  ciudadOrigen: "",
  nombreDestinatario: "",
  documentoDestinatario: "",
  telefonoDestinatario: "",
  direccionDestino: "",
  ciudadDestino: "",
  peso: "",
  tipoServicio: "",
  fechaEstimadaEntrega: "",
};

const CAMPOS_OBLIGATORIOS = Object.keys(CAMPOS_VACIOS) as InputName[];

export function RegistrarEnvio({ onRegistered }: RegistrarEnvioProps) {
  const [form, setForm] = useState<EnvioFormData>(CAMPOS_VACIOS);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successGuide, setSuccessGuide] = useState("");
  const [serverError, setServerError] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function missingFields() {
    return CAMPOS_OBLIGATORIOS.filter((field) => String(form[field]).trim() === "");
  }

  function fieldHasError(field: InputName) {
    return submitted && missingFields().includes(field);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);

    if (missingFields().length > 0 || Number(form.peso) <= 0) {
      return;
    }

    try {
      setSaving(true);
      setServerError("");
      const response = await registrarEnvio(form);
      setSuccessGuide(response.numeroGuia);
      setForm(CAMPOS_VACIOS);
      setSubmitted(false);
      onRegistered(response.numeroGuia);
    } catch {
      setServerError("No se pudo registrar el envío. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="feature-content">
      <header className="feature-heading">
        <p className="eyebrow">HU-01</p>
        <h2>Registrar nuevo envío</h2>
      </header>

      {successGuide && (
        <div className="alert success">
          Registro exitoso. Número de guía asignado: <strong>{successGuide}</strong>
        </div>
      )}

      {submitted && missingFields().length > 0 && (
        <div className="alert error">
          Completa los campos obligatorios resaltados antes de guardar.
        </div>
      )}

      {serverError && <div className="alert error">{serverError}</div>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <section className="form-section">
          <h3>Remitente</h3>
          <TextField
            label="Nombre"
            name="nombreRemitente"
            value={form.nombreRemitente}
            error={fieldHasError("nombreRemitente")}
            onChange={handleChange}
          />
          <TextField
            label="Documento"
            name="documentoRemitente"
            value={form.documentoRemitente}
            error={fieldHasError("documentoRemitente")}
            onChange={handleChange}
          />
          <TextField
            label="Teléfono"
            name="telefonoRemitente"
            value={form.telefonoRemitente}
            error={fieldHasError("telefonoRemitente")}
            onChange={handleChange}
          />
          <TextField
            label="Dirección de origen"
            name="direccionOrigen"
            value={form.direccionOrigen}
            error={fieldHasError("direccionOrigen")}
            onChange={handleChange}
          />
          <TextField
            label="Ciudad de origen"
            name="ciudadOrigen"
            value={form.ciudadOrigen}
            error={fieldHasError("ciudadOrigen")}
            onChange={handleChange}
          />
        </section>

        <section className="form-section">
          <h3>Destinatario</h3>
          <TextField
            label="Nombre"
            name="nombreDestinatario"
            value={form.nombreDestinatario}
            error={fieldHasError("nombreDestinatario")}
            onChange={handleChange}
          />
          <TextField
            label="Documento"
            name="documentoDestinatario"
            value={form.documentoDestinatario}
            error={fieldHasError("documentoDestinatario")}
            onChange={handleChange}
          />
          <TextField
            label="Teléfono"
            name="telefonoDestinatario"
            value={form.telefonoDestinatario}
            error={fieldHasError("telefonoDestinatario")}
            onChange={handleChange}
          />
          <TextField
            label="Dirección de destino"
            name="direccionDestino"
            value={form.direccionDestino}
            error={fieldHasError("direccionDestino")}
            onChange={handleChange}
          />
          <TextField
            label="Ciudad de destino"
            name="ciudadDestino"
            value={form.ciudadDestino}
            error={fieldHasError("ciudadDestino")}
            onChange={handleChange}
          />
        </section>

        <section className="form-section full">
          <h3>Paquete y servicio</h3>
          <div className="three-column">
            <TextField
              label="Peso (kg)"
              name="peso"
              type="number"
              value={form.peso}
              error={fieldHasError("peso") || (submitted && Number(form.peso) <= 0)}
              onChange={handleChange}
            />
            <SelectField
              label="Tipo de servicio"
              name="tipoServicio"
              value={form.tipoServicio}
              error={fieldHasError("tipoServicio")}
              options={[
                { label: "Estándar", value: "ESTANDAR" },
                { label: "Express", value: "EXPRESS" },
              ]}
              onChange={handleChange}
            />
            <TextField
              label="Fecha estimada"
              name="fechaEstimadaEntrega"
              type="date"
              value={form.fechaEstimadaEntrega}
              error={fieldHasError("fechaEstimadaEntrega")}
              onChange={handleChange}
            />
          </div>
        </section>

        <div className="actions-row full">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Registrando..." : "Registrar envío"}
          </button>
        </div>
      </form>
    </article>
  );
}

interface FieldProps {
  label: string;
  name: InputName;
  value: string;
  error: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
}

function TextField({ label, name, value, error, onChange, type = "text" }: FieldProps) {
  return (
    <label className="field">
      <span>{label} *</span>
      <input
        className={error ? "input-error" : ""}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

interface SelectFieldProps extends FieldProps {
  options: { label: string; value: string }[];
}

function SelectField({ label, name, value, error, options, onChange }: SelectFieldProps) {
  return (
    <label className="field">
      <span>{label} *</span>
      <select className={error ? "input-error" : ""} name={name} value={value} onChange={onChange}>
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
