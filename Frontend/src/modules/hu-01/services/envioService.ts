import type { EnvioFormData, EnvioResponse } from "../types/envio";
import { apiRequest } from "@tracelog/api-client";

export async function registrarEnvio(
  datos: EnvioFormData
): Promise<EnvioResponse> {
  return apiRequest<EnvioResponse>("/api/envios", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}
