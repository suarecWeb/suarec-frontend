"use client";

import { Inbox, Receipt, Printer } from "lucide-react";

const VentasFisicasManagement = () => {
  return (
    <div className="py-16 text-center">
      <div className="bg-gray-50 border border-gray-100 inline-flex rounded-full p-5 mb-4">
        <Receipt className="h-9 w-9 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-700">
        Historial de ventas físicas
      </h3>
      <p className="mt-1.5 text-sm text-gray-400 max-w-md mx-auto">
        Próximamente podrás consultar todas las ventas presenciales realizadas,
        reimprimir tickets y exportar reportes diarios.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#097EEC] text-xs font-medium">
        <Printer className="h-4 w-4" />
        Integración con impresora térmica POS-80C en desarrollo
      </div>
    </div>
  );
};

export default VentasFisicasManagement;
