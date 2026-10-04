import api from "./axios_config";
import {
  FeriaConEventosPalco,
  MapaEventoPalco,
  PrecioPalco,
  PreciosEvento,
} from "@/interfaces/palcos.interface";

// "Gestion de palcos" y precios por palco: solo super admin (SuperAdminGuard
// en el controlador). Reservar y apartar son de las fases 4 y 7
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
};

export default PalcosService;
