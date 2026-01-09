import { Target, TrendingUp } from "lucide-react";

interface StatsGrowthCardProps {
  totalEarnings: number;
  totalContractsCompleted: number;
  totalPublications: number;
}

export const StatsGrowthCard: React.FC<StatsGrowthCardProps> = ({
  totalEarnings,
  totalContractsCompleted,
  totalPublications,
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-purple-600" />
        Tu Crecimiento
      </h3>
      <div className="space-y-4">
        <div className="text-center p-4 bg-white/70 rounded-lg">
          <div className="text-3xl mb-2">
            <TrendingUp className="h-8 w-8 text-purple-600 inline-block" />
          </div>
          <h4 className="font-bold text-purple-800 mb-2">
            {totalEarnings > 0
              ? "¡Eres un profesional establecido!"
              : "¡Tu aventura en SUAREC está comenzando!"}
          </h4>
          <p className="text-sm text-purple-700">
            {totalEarnings > 0
              ? "Has demostrado tu valor en nuestra plataforma. ¡Sigue construyendo tu reputación!"
              : "¡Estás a un paso de generar tus primeros ingresos con SUAREC!"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {totalContractsCompleted}
            </div>
            <p className="text-xs text-purple-700">Contratos exitosos</p>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {totalPublications}
            </div>
            <p className="text-xs text-purple-700">Servicios ofrecidos</p>
          </div>
        </div>
      </div>
    </div>
  );
};
