import { Eye, EyeOff } from "lucide-react";

// Ocultar o mostrar el evento en la app desde la barra azul. Si está oculto,
// el botón se resalta para que se note
export default function BotonVisibilidad({
  visible,
  cambiando,
  onClick,
}: {
  visible: boolean;
  cambiando: boolean;
  onClick: () => void;
}) {
  const texto = visible ? "Ocultar de app" : "Mostrar en app";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={cambiando}
      title={texto}
      aria-label={texto}
      className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        visible
          ? "bg-white/10 hover:bg-white/20"
          : "bg-amber-300 text-amber-900 hover:bg-amber-200"
      }`}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      <span className="hidden sm:inline">{texto}</span>
    </button>
  );
}
