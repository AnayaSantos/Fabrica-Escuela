import type { ChangeEvent } from "react";
import type { EnvioFormData } from "../types/envio";

interface OpcionCampo {
  label: string;
  value: string;
}

interface CampoProps {
  etiqueta: string;
  name: keyof EnvioFormData;
  value: string;
  tieneError: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  min?: string;
  opciones?: OpcionCampo[];
}

export function Campo({
  etiqueta,
  name,
  value,
  tieneError,
  onChange,
  type = "text",
  min,
  opciones,
}: CampoProps) {
  const estiloCampo = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 4,
    border: tieneError ? "1px solid #dc2626" : "1px solid #ccc",
    background: tieneError ? "#fca5a5" : "#fff",
    color: "#111",
    boxSizing: "border-box" as const,
    fontSize: 14,
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={name}
        style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#222" }}
      >
        {etiqueta} <span style={{ color: "#dc2626" }}>*</span>
      </label>
      {opciones ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          style={estiloCampo}
        >
          <option value="">Selecciona una opción</option>
          {opciones.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          min={min}
          value={value}
          onChange={onChange}
          style={estiloCampo}
        />
      )}
    </div>
  );
}
