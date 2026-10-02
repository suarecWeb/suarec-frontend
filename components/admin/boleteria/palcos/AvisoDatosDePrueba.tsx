import { FlaskConical } from "lucide-react";

// BORRAR junto con datosDePrueba.ts: avisa que lo que se ve es de ejemplo
export default function AvisoDatosDePrueba() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <FlaskConical className="h-4 w-4 flex-shrink-0 mt-px" />
      <p>
        <span className="font-semibold">Datos de prueba.</span> Esta sección
        muestra cómo se verá la venta de palcos por evento. Los eventos, el
        recinto y los estados son de ejemplo; los reales llegan con la fase 4.
      </p>
    </div>
  );
}
