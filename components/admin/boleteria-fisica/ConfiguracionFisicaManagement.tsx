"use client";

import { useState, useEffect } from "react";
import { Printer, Usb, Save, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const STORAGE_KEY = "suarec-boleteria-fisica-config";

interface FisicaConfig {
  printerName: string;
  agentUrl: string;
  paperWidth: number;
  copies: number;
}

const DEFAULT_CONFIG: FisicaConfig = {
  printerName: "POS-80C",
  agentUrl: "http://localhost:3001",
  paperWidth: 80,
  copies: 1,
};

const ConfiguracionFisicaManagement = () => {
  const [config, setConfig] = useState<FisicaConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FisicaConfig>;
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      toast.success("Configuración guardada localmente");
    } catch {
      toast.error("No se pudo guardar la configuración");
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
    toast("Configuración restaurada por defecto");
  };

  if (!loaded) return null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Printer className="h-5 w-5 text-[#097EEC]" />
        <h2 className="text-lg font-semibold text-gray-900">
          Configuración de impresión
        </h2>
      </div>

      <div className="space-y-4 bg-white rounded-xl border border-gray-100 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la impresora térmica
          </label>
          <input
            type="text"
            value={config.printerName}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, printerName: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL del agente de impresión local
          </label>
          <div className="relative">
            <Usb className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={config.agentUrl}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, agentUrl: e.target.value }))
              }
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Debe coincidir con el servidor local que recibe la imagen del ticket
            para imprimir.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ancho del papel (mm)
            </label>
            <input
              type="number"
              min={58}
              max={80}
              value={config.paperWidth}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  paperWidth: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copias por defecto
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={config.copies}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  copies: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#097EEC] text-white hover:bg-[#0562C7] transition-colors shadow"
          >
            <Save className="h-4 w-4" />
            Guardar configuración
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionFisicaManagement;
