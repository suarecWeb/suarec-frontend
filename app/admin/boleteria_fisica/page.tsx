"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import RoleGuard from "@/components/role-guard";
import { BoleteriaFisicaTicket } from "@/components/admin/BoleteriaFisicaTicket";
import { Printer, ArrowLeft, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const contentVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

const BoleteriaFisicaPageContent = () => {
  const [qrValue, setQrValue] = useState("SUAREC-EVT-001-TKT-0001");
  const [tipoBoleta, setTipoBoleta] = useState<"GENERAL" | "VIP">("GENERAL");
  const [fechaEvento, setFechaEvento] = useState(
    "Domingo, 19 de julio de 2026",
  );
  const [horaEvento, setHoraEvento] = useState("6:00 p.m.");
  const [ubicacion, setUbicacion] = useState("La Herradura, Cauca");
  const [precio, setPrecio] = useState("20000");
  const [cantidad, setCantidad] = useState(1);
  const [fechaCompra, setFechaCompra] = useState(
    new Date().toLocaleDateString("es-CO"),
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/admin/boleteria" passHref>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Volver a Boletería"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </motion.button>
                </Link>
                <h1 className="text-3xl font-bold">Boletería Física</h1>
              </div>
              <p className="mt-2 text-blue-100">
                Venta presencial de boletas con impresión térmica 80mm
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white">
              <Printer className="h-4 w-4" />
              POS-80C
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Panel de configuración de la venta */}
            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit"
            >
              <div className="flex items-center gap-2 mb-5">
                <ShoppingCart className="h-5 w-5 text-[#097EEC]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Datos de la venta
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de boleta
                  </label>
                  <select
                    value={tipoBoleta}
                    onChange={(e) =>
                      setTipoBoleta(e.target.value as "GENERAL" | "VIP")
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm bg-white"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha del evento
                    </label>
                    <input
                      type="text"
                      value={fechaEvento}
                      onChange={(e) => setFechaEvento(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                      placeholder="Domingo, 19 de julio de 2026"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora del evento
                    </label>
                    <input
                      type="text"
                      value={horaEvento}
                      onChange={(e) => setHoraEvento(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                      placeholder="6:00 p.m."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                    placeholder="La Herradura, Cauca"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio (COP)
                    </label>
                    <input
                      type="text"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                      placeholder="20000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={cantidad}
                      onChange={(e) => setCantidad(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de compra
                  </label>
                  <input
                    type="text"
                    value={fechaCompra}
                    onChange={(e) => setFechaCompra(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                    placeholder="14/07/2026"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-gray-700">
                <p className="font-medium text-[#097EEC] mb-1">Nota</p>
                <p>
                  Estos datos son solo para la vista previa. En el flujo real se
                  generarán automáticamente desde el backend.
                </p>
              </div>
            </motion.div>

            {/* Vista previa del ticket */}
            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3, delay: 0.1, ease: "easeInOut" }}
              className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 w-full">
                Vista previa del ticket
              </h2>

              <BoleteriaFisicaTicket
                qrValue={qrValue}
                tipoBoleta={tipoBoleta}
                precio={precio}
                fechaCompra={fechaCompra}
                cantidad={cantidad}
                evento={{
                  fecha: fechaEvento,
                  hora: horaEvento,
                  lugar: ubicacion,
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BoleteriaFisicaPage = () => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <BoleteriaFisicaPageContent />
  </RoleGuard>
);

export default BoleteriaFisicaPage;
