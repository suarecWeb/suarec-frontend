import api from "./axios_config";
import {
  ApartarPalcoDatos,
  FeriaConEventosPalco,
  MapaEventoPalco,
  PalcoOcupadoAdmin,
  PrecioPalco,
  PreciosEvento,
} from "@/interfaces/palcos.interface";

// "Gestion de palcos", precios por palco y apartar palcos: solo super admin
// (SuperAdminGuard en el controlador)
const BASE = "/suarec/palcos";

const PalcosService = {
  // Eventos PALCO por feria con cuantos palcos hay en cada estado
  getEventosConPalcos: (): Promise<{ data: FeriaConEventosPalco[] }> =>
    api.get(`${BASE}/eventos`),

  // Mapa de un evento: recinto, estado y detalle de cada palco
  getMapaEvento: (eventoId: number): Promise<{ data: MapaEventoPalco }> =>
    api.get(`${BASE}/eventos/${eventoId}`),

  // Precio base y precios propios de los palcos de un evento PALCO
  getPrecios: (eventoId: number): Promise<{ data: PreciosEvento }> =>
    api.get(`${BASE}/eventos/${eventoId}/precios`),

  // Reemplaza TODOS los precios propios (todo o nada). Lista vacia = todos
  // los palcos al precio base
  guardarPrecios: (
    eventoId: number,
    precios: PrecioPalco[],
  ): Promise<{ data: PreciosEvento }> =>
    api.put(`${BASE}/eventos/${eventoId}/precios`, { precios }),

  // Un PDF con las boletas de un palco apartado (una por página)
  descargarBoletasPdf: (
    eventoId: number,
    figuraId: number,
  ): Promise<{ data: Blob }> =>
    api.get(`${BASE}/eventos/${eventoId}/palcos/${figuraId}/boletas-pdf`, {
      responseType: "blob",
    }),

  // Un palco apartado pasa a vendido; ahí se generan sus 10 boletas
  marcarVendido: (
    eventoId: number,
    figuraId: number,
  ): Promise<{ data: { figuraId: number; estado: "VENDIDO" } }> =>
    api.post(`${BASE}/eventos/${eventoId}/palcos/${figuraId}/marcar-vendido`),

  // Libera un palco apartado: vuelve a estar libre para todos
  liberarPalco: (
    eventoId: number,
    figuraId: number,
  ): Promise<{ data: { figuraId: number; estado: "LIBRE" } }> =>
    api.post(`${BASE}/eventos/${eventoId}/palcos/${figuraId}/liberar`),

  // Aparta un palco libre para un cliente; responde el palco ya apartado
  apartarPalco: (
    eventoId: number,
    figuraId: number,
    datos: ApartarPalcoDatos,
  ): Promise<{ data: PalcoOcupadoAdmin }> =>
    api.post(`${BASE}/eventos/${eventoId}/palcos/${figuraId}/apartar`, datos),
};

export default PalcosService;
