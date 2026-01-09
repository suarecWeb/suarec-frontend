import { Award, TrendingUp, Target, CheckCircle, XCircle } from "lucide-react";
import { UserLevel } from "@/interfaces/level.interface";

interface UserLevelCardProps {
  levelData: UserLevel;
}

const getLevelColor = (level: string) => {
  const colors = {
    Nuevo: "bg-gray-100 text-gray-700 border-gray-300",
    Activo: "bg-blue-100 text-blue-700 border-blue-300",
    Profesional: "bg-purple-100 text-purple-700 border-purple-300",
    Elite: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };
  return colors[level as keyof typeof colors] || colors.Nuevo;
};

const getLevelIcon = (level: string) => {
  const icons = {
    Nuevo: "🌱",
    Activo: "⚡",
    Profesional: "🏆",
    Elite: "👑",
  };
  return icons[level as keyof typeof icons] || "🌱";
};

export const UserLevelCard: React.FC<UserLevelCardProps> = ({ levelData }) => {
  const {
    current_level,
    next_level,
    progress_pct,
    metrics,
    next_goal,
    recommended_action,
  } = levelData;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Award className="h-6 w-6 text-[#097EEC]" />
        Tu Nivel SUAREC
      </h3>

      {/* Current Level Badge */}
      <div className="flex items-center justify-center mb-6">
        <div
          className={`${getLevelColor(current_level)} px-8 py-4 rounded-2xl border-2 text-center`}
        >
          <div className="text-4xl mb-2">{getLevelIcon(current_level)}</div>
          <h4 className="text-2xl font-bold">{current_level}</h4>
          <p className="text-sm opacity-75">Nivel Actual</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.successfulContracts}
          </div>
          <p className="text-xs text-blue-700">Contratos Exitosos</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {metrics.ratingAvg.toFixed(1)} ⭐
          </div>
          <p className="text-xs text-yellow-700">Calificación</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {(metrics.cancelRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-green-700">Tasa Cancelación</p>
        </div>
      </div>

      {/* Progress to Next Level */}
      {next_level ? (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Progreso hacia {next_level}
              </span>
              <span className="text-sm font-bold text-[#097EEC]">
                {progress_pct.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#097EEC] to-[#0A6BC7] h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress_pct}%` }}
              ></div>
            </div>
          </div>

          {/* Next Goal */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <h5 className="font-semibold text-gray-800">Próximo Objetivo</h5>
            </div>
            <p className="text-sm text-gray-700 mb-2">{next_goal.label}</p>
            {next_goal.remaining !== null && next_goal.remaining > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Actual: {next_goal.current} / Meta: {next_goal.target}
                </span>
                <span className="text-xs font-bold text-purple-600">
                  Faltan: {next_goal.remaining}
                </span>
              </div>
            )}
          </div>

          {/* Recommended Action */}
          <div className="bg-gradient-to-r from-[#097EEC] to-[#0A6BC7] rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <h5 className="font-semibold">Acción Recomendada</h5>
            </div>
            <p className="text-sm">{recommended_action.label}</p>
          </div>
        </>
      ) : (
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-700">
            ¡Has alcanzado el nivel máximo!
          </p>
          <p className="text-xs text-green-600 mt-1">
            Mantén tu excelente desempeño
          </p>
        </div>
      )}
    </div>
  );
};
