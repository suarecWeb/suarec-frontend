import { Recinto } from "./recinto.interface";

// Respuestas de /palcos/eventos ("Gestion de palcos", solo super admin).
// Estado de un palco EN UN EVENTO; el que no viene, esta libre
export type EstadoPalcoOcupado = "EN_COMPRA" | "APARTADO" | "VENDIDO";
export type ConteoPalcos = Record<"LIBRE" | EstadoPalcoOcupado, number>;

// GET /palcos/eventos: un evento PALCO en la lista del tab
export interface EventoPalcoResumen {
  id: number;
  nombre: string;
  fechaEvento: string;
  // preventa | venta | cerrado | cancelado
  estado: string;
  conteo: ConteoPalcos;
  // Palcos dibujados en el recinto de su feria (RN-20)
  total: number;
  // Ventas en palcos que ya no estan en el recinto (la feria lo cambio,
  // RN-24): no aparecen en el mapa
  fueraDelRecinto: number;
}

export interface FeriaConEventosPalco {
  id: number;
  nombre: string;
  // null: la feria no tiene recinto, sus eventos no tienen mapa
  recinto: { id: number; nombre: string } | null;
  eventos: EventoPalcoResumen[];
}

// GET /palcos/eventos/:id: lo que paso con un palco en el evento. El
// detalle (comprador, quien lo aparto) solo lo ve el admin; la app nunca
// sabe quien compro (PEN-5)
export interface PalcoOcupadoAdmin {
  figuraId: number;
  estado: EstadoPalcoOcupado;
  // Nombre copiado al vender (RN-19)
  palcoNombre: string;
  // Cuando lo tomo el comprador o lo aparto el admin
  reservadoEn: string | null;
  // EN_COMPRA: hasta cuando dura la reserva (RN-06)
  reservadoHasta: string | null;
  // Pago en curso con el banco: ventana de gracia (RN-17)
  graciaHasta: string | null;
  monto: number | null;
  comprador: { id: number; nombre: string; email: string } | null;
  apartadoPor: { id: number; nombre: string } | null;
  nota: string | null;
  // Cuando quedo en su estado actual
  actualizadoEn: string;
}

// Precio propio de un palco en un evento (RN-12). El palco que no viene
// vale el precio base del evento
export interface PrecioPalco {
  figuraId: number;
  precio: number;
}

// GET y PUT /palcos/eventos/:id/precios
export interface PreciosEvento {
  eventoId: number;
  precioBase: number;
  precios: PrecioPalco[];
}

export interface MapaEventoPalco {
  evento: {
    id: number;
    nombre: string;
    fechaEvento: string;
    estado: string;
    precioPalco: number;
    // Una sola vez por palco (RN-15)
    cargoSuarec: number;
    feria: { id: number; nombre: string } | null;
  };
  // El de su feria, con sus figuras; null si la feria no tiene recinto
  recinto: Recinto | null;
  palcos: PalcoOcupadoAdmin[];
  palcosFueraDelRecinto: number;
  // Solo los palcos con precio propio
  precios: PrecioPalco[];
  // Los eventos PALCO de la feria, por fecha (anterior/siguiente)
  deLaFeria: { id: number; nombre: string; fechaEvento: string }[];
  // Hora del servidor al responder: el contador no depende del reloj del computador
  servidorAhora: string;
}

// Aviso en vivo de un palco para el admin. reload: cambio todo el mapa
// (precios, dibujo, recinto o estado del evento) y hay que pedirlo de nuevo
export interface AvisoPalcoAdmin {
  eventoId: number;
  figuraId?: number;
  estado?: "LIBRE" | EstadoPalcoOcupado;
  reservadoEn?: string | null;
  reservadoHasta?: string | null;
  graciaHasta?: string | null;
  comprador?: PalcoOcupadoAdmin["comprador"];
  reload: boolean;
  cambiadoEn: string;
}
