import { PayloadImpresionDedicada } from "@/interfaces/plantilla-dedicada.interface";

export async function sendDedicatedPrint(
  agentUrl: string,
  payload: PayloadImpresionDedicada,
): Promise<void> {
  const response = await fetch(
    `${agentUrl.replace(/\/$/, "")}/print-dedicada`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok)
    throw new Error(`El agente rechazó la impresión (${response.status}).`);
  // El agente puede contestar sin body; si informa un fallo, no mostrar éxito.
  const text = await response.text();
  if (text) {
    const result = JSON.parse(text);
    if (result.success === false)
      throw new Error(result.error || "El agente no pudo imprimir la venta.");
  }
}
