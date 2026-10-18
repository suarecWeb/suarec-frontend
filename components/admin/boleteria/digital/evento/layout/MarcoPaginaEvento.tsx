"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import AdminSidePanel from "@/components/AdminSidePanel";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import { RUTA_BOLETERIA_DIGITAL } from "../rutas";

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// Barra azul con el estilo de Boletería (se va con el scroll): ← título,
// debajo la miga de pan "Boletería › Digital", los botones y, en un PALCO,
// las pestañas del evento. El menú lateral marca Digital. En el celular
// los botones quedan fijos abajo
export default function MarcoPaginaEvento({
  titulo,
  volver,
  acciones,
  extra,
  pestanas,
  children,
}: {
  titulo: string;
  volver: string;
  // Botón que va en la barra azul también en el celular (ocultar o mostrar
  // el evento en la app)
  extra?: ReactNode;
  // Cancelar y Crear/Guardar (no hay mientras carga el evento). Se pintan
  // en la barra azul de arriba y, en el celular, en la barra blanca de abajo
  acciones?: (lugar: "arriba" | "abajo") => ReactNode;
  // "Datos y precios" | "Gestión de palcos" (PestanasEvento)
  pestanas?: ReactNode;
  children: ReactNode;
}) {
  const { width: panelWidth, onMouseDown: onPanelDrag } = useResizablePanel();

  // globals.css pone overflow-x: hidden en html y body, y eso anula todo
  // "sticky" (la columna de la feria no se quedaría fija). clip recorta
  // igual pero no lo anula; solo mientras esta página está abierta. Si el
  // navegador no conoce clip, queda como estaba
  useEffect(() => {
    const elementos = [document.documentElement, document.body];
    const antes = elementos.map((el) => el.style.overflowX);
    elementos.forEach((el) => (el.style.overflowX = "clip"));
    return () => elementos.forEach((el, i) => (el.style.overflowX = antes[i]));
  }, []);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <Navbar />
      <div
        className={`bg-gray-50 min-h-screen pt-16 lg:pt-20 ${acciones ? "pb-24 sm:pb-12" : "pb-12"}`}
      >
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4 flex items-start gap-4">
            <Link
              href={volver}
              aria-label="Volver"
              className="flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold truncate">{titulo}</h1>
              <nav
                aria-label="Miga de pan"
                className="mt-2 flex items-center gap-1 text-blue-100"
              >
                <span>Boletería</span>
                <ChevronRight className="h-4 w-4" />
                <Link href={RUTA_BOLETERIA_DIGITAL} className="hover:underline">
                  Digital
                </Link>
              </nav>
            </div>
            {extra && <div className="flex-shrink-0">{extra}</div>}
            {acciones && (
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                {acciones("arriba")}
              </div>
            )}
          </div>
          {pestanas && (
            <div className="container mx-auto px-4 mt-4 overflow-x-auto">
              {pestanas}
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 -mt-4 flex">
          <div
            className="hidden md:flex flex-col gap-[24px] flex-shrink-0"
            style={{ width: panelWidth }}
          >
            <AdminSidePanel />
          </div>
          <div
            className="hidden md:flex items-center justify-center w-3 flex-shrink-0 cursor-col-resize group select-none"
            onMouseDown={onPanelDrag}
          >
            <div className="w-0.5 h-12 rounded-full bg-gray-200 group-hover:bg-[#097EEC] transition-colors duration-150" />
          </div>
          <div className="flex-1 min-w-0 md:ml-3">{children}</div>
        </div>

        {acciones && (
          // pr-20: a la derecha queda el botón flotante de mensajes
          <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 p-3 pr-20 flex gap-2">
            {acciones("abajo")}
          </div>
        )}
      </div>
    </motion.div>
  );
}
