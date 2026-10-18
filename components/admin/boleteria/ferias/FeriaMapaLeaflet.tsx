"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icono por defecto de Leaflet con assets propios (/public/images) -- evita
// el problema clásico de bundlers con las rutas de iconos del paquete.
const pinIcon = new L.Icon({
  iconUrl: "/images/marker-icon.svg",
  shadowUrl: "/images/marker-shadow.svg",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -34],
  shadowSize: [41, 41],
  shadowAnchor: [20, 20],
});

// Centro por defecto cuando todavía no hay pin -- Cali, sede principal de
// SUAREC (la mayoría de ferias arrancan la búsqueda cerca de ahí).
const CALI: [number, number] = [3.4516, -76.532];

interface FeriaMapaLeafletProps {
  latitud: number | null;
  longitud: number | null;
  // Clics en el mapa y arrastres del pin reportan la nueva coordenada --
  // el texto de `ubicacion` nunca se toca desde acá (ver ADR-3 del roadmap:
  // texto y pin quedan independientes a propósito).
  onMover: (lat: number, lng: number) => void;
  // false = preview de solo lectura (recuadro chico): sin pan/zoom/clic ni
  // pin arrastrable, se ve pero no se toca (ADR-2 del roadmap). true = el
  // mapa del modal expandido, donde sí se ubica el pin.
  interactivo: boolean;
}

function ClicksDelMapa({
  onMover,
}: {
  onMover: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMover(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Leaflet calcula el tamaño del mapa UNA vez, al montar -- si el contenedor
// todavia esta acomodando su layout en ese instante (flex + portal del modal
// expandido), el mapa queda con tiles en blanco aunque el recuadro ya tenga
// el tamaño correcto en CSS. Un ResizeObserver avisa a Leaflet cada vez que
// el contenedor cambia de tamaño, sin depender de un timeout adivinado.
function InvalidadorDeTamano() {
  const map = useMap();
  useEffect(() => {
    const contenedor = map.getContainer();
    const corregir = () => map.invalidateSize();
    // Corrida inmediata (por si la primera medición de Leaflet, al montar,
    // ya fue chica) + una vez mas en el siguiente frame, ademas del
    // ResizeObserver para cambios de tamaño posteriores (ej. al expandir).
    corregir();
    const raf = requestAnimationFrame(corregir);
    const observer = new ResizeObserver(corregir);
    observer.observe(contenedor);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

export default function FeriaMapaLeaflet({
  latitud,
  longitud,
  onMover,
  interactivo,
}: FeriaMapaLeafletProps) {
  const hayPin = latitud !== null && longitud !== null;
  const centro = useMemo<[number, number]>(
    () => (hayPin ? [latitud as number, longitud as number] : CALI),
    // Solo recalcula el centro inicial del mapa -- moverlo despues (drag/click)
    // no debe recentrar la vista, por eso no depende de latitud/longitud en
    // cada render, solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <MapContainer
      center={centro}
      zoom={hayPin ? 15 : 12}
      scrollWheelZoom={interactivo}
      dragging={interactivo}
      touchZoom={interactivo}
      doubleClickZoom={interactivo}
      boxZoom={interactivo}
      keyboard={interactivo}
      zoomControl={interactivo}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {interactivo && <ClicksDelMapa onMover={onMover} />}
      <InvalidadorDeTamano />
      {hayPin && (
        <Marker
          position={[latitud as number, longitud as number]}
          icon={pinIcon}
          draggable={interactivo}
          eventHandlers={
            interactivo
              ? {
                  dragend: (e) => {
                    const pos = e.target.getLatLng();
                    onMover(pos.lat, pos.lng);
                  },
                }
              : undefined
          }
        />
      )}
    </MapContainer>
  );
}
