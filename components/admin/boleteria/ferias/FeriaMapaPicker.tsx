"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { MapPin, Search, Loader2, X, Maximize2 } from "lucide-react";
import MapsService from "@/services/MapsService";

// Leaflet usa `window` -- en Next.js App Router esto tiene que cargar solo
// en el cliente, nunca en el render de servidor.
const FeriaMapaLeaflet = dynamic(() => import("./FeriaMapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
      Cargando mapa...
    </div>
  ),
});

interface FeriaMapaPickerProps {
  ubicacion: string;
  onUbicacionChange: (value: string) => void;
  latitud: number | null;
  longitud: number | null;
  onCoordenadasChange: (lat: number | null, lng: number | null) => void;
  errorUbicacion?: string;
}

// Input de dirección (texto libre, igual que buscarla en Google Maps desde
// el teléfono) + mapa OSM con pin ajustable a mano. Ver roadmap
// google-maps-evento-ubicacion.txt ADR-2/ADR-3 para el porqué de cada
// decisión acá (Nominatim en vez de Google, texto y pin independientes).
export default function FeriaMapaPicker({
  ubicacion,
  onUbicacionChange,
  latitud,
  longitud,
  onCoordenadasChange,
  errorUbicacion,
}: FeriaMapaPickerProps) {
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  // El recuadro inline es chico a propósito (no estorba el resto del
  // formulario) -- para ubicar el pin con precisión se expande a un modal
  // grande con el mismo mapa (createPortal: evita quedar atrapado detrás
  // del backdrop-blur del modal de Crear/Editar feria, que crea su propio
  // stacking context).
  const [mapaExpandido, setMapaExpandido] = useState(false);
  // Autogeocode al abrir Editar con texto pero sin pin todavía (ver UC-1 del
  // roadmap) -- solo una vez, no cada vez que cambie el texto o el pin.
  const yaAutogeocodio = useRef(false);

  const buscarDireccion = async () => {
    const query = ubicacion.trim();
    if (query.length < 3) {
      setErrorBusqueda("Escribe al menos 3 caracteres para buscar.");
      return;
    }
    setBuscando(true);
    setErrorBusqueda(null);
    try {
      const { data } = await MapsService.geocode(query);
      onCoordenadasChange(data.latitud, data.longitud);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setErrorBusqueda(
          "No se encontraron coordenadas para esa dirección. Puedes ubicar el pin manualmente en el mapa.",
        );
      } else {
        setErrorBusqueda(
          "No se pudo buscar en este momento. Puedes ubicar el pin manualmente.",
        );
      }
    } finally {
      setBuscando(false);
    }
  };

  useEffect(() => {
    if (yaAutogeocodio.current) return;
    if (latitud !== null || longitud !== null) return;
    if (!ubicacion.trim()) return;
    yaAutogeocodio.current = true;
    buscarDireccion();
    // Solo al montar -- ver comentario de yaAutogeocodio arriba
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        <MapPin className="h-3 w-3 inline mr-1" />
        Ubicación <span className="text-red-400">*</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={ubicacion}
          onChange={(e) => onUbicacionChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              buscarDireccion();
            }
          }}
          placeholder="Ciudad o dirección (ej. Coliseo Mayor, Popayán)"
          className={`flex-1 min-w-0 px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${errorUbicacion ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
        />
        <button
          type="button"
          onClick={buscarDireccion}
          disabled={buscando}
          title="Buscar en el mapa"
          className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-[#097EEC] hover:text-[#097EEC] disabled:opacity-50 transition-colors flex-shrink-0"
        >
          {buscando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>
      {errorUbicacion && (
        <p className="mt-1 text-xs text-red-500">{errorUbicacion}</p>
      )}
      {errorBusqueda && (
        <p className="mt-1 text-xs text-amber-700">{errorBusqueda}</p>
      )}

      {/* Solo preview -- no interactivo (ADR-2 del roadmap). Para ubicar o
        ajustar el pin con precisión hay que expandir el mapa. */}
      <div className="relative mt-2 h-48 rounded-lg overflow-hidden border border-gray-200">
        <FeriaMapaLeaflet
          latitud={latitud}
          longitud={longitud}
          onMover={() => {}}
          interactivo={false}
        />
        <button
          type="button"
          onClick={() => setMapaExpandido(true)}
          title="Expandir mapa"
          className="absolute top-2 right-2 z-[1000] p-1.5 rounded-lg bg-white/90 border border-gray-200 text-gray-500 shadow-sm hover:text-[#097EEC] hover:border-[#097EEC] transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          {latitud !== null && longitud !== null
            ? "Pin ubicado. Expande el mapa para ajustarlo con precisión."
            : "Busca una dirección o expande el mapa para ubicar el pin."}
        </p>
        {latitud !== null && longitud !== null && (
          <button
            type="button"
            onClick={() => onCoordenadasChange(null, null)}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <X className="h-3 w-3" />
            Quitar pin
          </button>
        )}
      </div>

      {mapaExpandido &&
        typeof document !== "undefined" &&
        createPortal(
          // z-[60]: el navbar global (navbar.tsx) usa z-40 y los modales de
          // Crear/Editar feria z-50 -- con eso alcanza para quedar encima,
          // sin irse a un valor exagerado como z-[200].
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 gap-3">
                <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                  Ubicar en el mapa
                </p>
                <div className="flex-1 flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => onUbicacionChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        buscarDireccion();
                      }
                    }}
                    placeholder="Buscar dirección..."
                    className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-200 bg-gray-50 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={buscarDireccion}
                    disabled={buscando}
                    title="Buscar en el mapa"
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#097EEC] hover:text-[#097EEC] disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    {buscando ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setMapaExpandido(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {errorBusqueda && (
                <p className="px-5 pt-2 text-xs text-amber-700">
                  {errorBusqueda}
                </p>
              )}

              {/* Alto FIJO (no flex-1 + min-h): Leaflet necesita que el
                contenedor tenga una altura DEFINIDA desde el primer render
                para calcular bien cuántos tiles pedir -- con flex-1 +
                min-height a veces media el tamaño antes de que el flex
                termine de resolverse y se quedaba pidiendo un solo tile.
                55vh (no 90vh) para que quede margen visible del fondo. */}
              <div className="mt-2 h-[55vh]">
                <FeriaMapaLeaflet
                  latitud={latitud}
                  longitud={longitud}
                  onMover={(lat, lng) => onCoordenadasChange(lat, lng)}
                  interactivo
                />
              </div>

              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                <p className="text-[11px] text-gray-400">
                  Arrastra el pin o toca el mapa para ajustar la posición
                  exacta.
                </p>
                <button
                  type="button"
                  onClick={() => setMapaExpandido(false)}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] transition-colors flex-shrink-0"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
