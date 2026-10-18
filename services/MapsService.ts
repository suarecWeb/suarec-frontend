import api from "./axios_config";

export interface GeocodeResult {
  latitud: number;
  longitud: number;
}

const BASE = "/suarec/maps";

// Proxy del backend hacia Nominatim (ver roadmap
// google-maps-evento-ubicacion.txt) -- nunca se llama a un proveedor de
// mapas directo desde el frontend.
const MapsService = {
  geocode: (query: string): Promise<{ data: GeocodeResult }> =>
    api.get(`${BASE}/geocode`, { params: { query } }),
};

export default MapsService;
