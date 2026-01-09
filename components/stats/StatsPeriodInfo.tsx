import {
  Calendar,
  Award,
  AlertCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { StatsTimeRange } from "@/interfaces/user-stats.interface";

interface StatsPeriodInfoProps {
  selectedTimeRange: StatsTimeRange;
  totalContractsCompleted: number;
  totalPublications: number;
  getTimeRangeLabel: (range: StatsTimeRange) => string;
}

export const StatsPeriodInfo: React.FC<StatsPeriodInfoProps> = ({
  selectedTimeRange,
  totalContractsCompleted,
  totalPublications,
  getTimeRangeLabel,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-indigo-600" />
        📅 Período de Análisis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600 mb-1">
            {getTimeRangeLabel(selectedTimeRange)}
          </div>
          <p className="text-sm text-indigo-700">Período seleccionado</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-1 flex items-center justify-center gap-2">
            {totalContractsCompleted > 0 ? (
              <>
                <Award className="h-6 w-6 text-green-600" />
                Activo
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                Preparándote
              </>
            )}
          </div>
          <p className="text-sm text-green-700">Estado en SUAREC</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1 flex items-center justify-center gap-2">
            {totalPublications > 0 ? (
              <>
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Creciendo
              </>
            ) : (
              <>
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Comenzando
              </>
            )}
          </div>
          <p className="text-sm text-blue-700">Tu progreso</p>
        </div>
      </div>
    </div>
  );
};
