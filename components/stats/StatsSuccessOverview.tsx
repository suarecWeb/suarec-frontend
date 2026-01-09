import { Award } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

interface StatsSuccessOverviewProps {
  totalEarnings: number;
  totalContractsCompleted: number;
  totalPublications: number;
}

export const StatsSuccessOverview: React.FC<StatsSuccessOverviewProps> = ({
  totalEarnings,
  totalContractsCompleted,
  totalPublications,
}) => {
  const averagePerContract =
    totalContractsCompleted > 0 ? totalEarnings / totalContractsCompleted : 0;

  const successRate =
    totalPublications > 0
      ? Math.round((totalContractsCompleted / totalPublications) * 100)
      : 0;

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-sm border border-green-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-green-600" />
        Tu Éxito en SUAREC
      </h3>
      <div className="space-y-4">
        <div className="bg-white/70 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">
              Ingresos promedio por contrato:
            </span>
            <span className="font-bold text-green-600 text-lg">
              {formatCurrency(averagePerContract, { showCurrency: true })}
            </span>
          </div>
          <p className="text-sm text-green-700">
            ¡Excelente! Cada contrato te genera buenos ingresos
          </p>
        </div>

        <div className="bg-white/70 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Tasa de éxito:</span>
            <span className="font-bold text-blue-600 text-lg">
              {successRate}%
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {totalPublications > 0 && totalContractsCompleted > 0
              ? "¡Increíble conversión de publicaciones a contratos!"
              : "¡Publica más servicios para aumentar tus oportunidades!"}
          </p>
        </div>
      </div>
    </div>
  );
};
