import { LevelName } from "@/interfaces/level.interface";
import { Check } from "lucide-react";

interface LevelProgressTimelineProps {
  currentLevel: LevelName;
  progress: number;
}

const levels: { name: LevelName; icon: string; color: string }[] = [
  { name: "Nuevo", icon: "🌱", color: "bg-gray-400" },
  { name: "Activo", icon: "⚡", color: "bg-blue-500" },
  { name: "Profesional", icon: "🏆", color: "bg-purple-500" },
  { name: "Elite", icon: "👑", color: "bg-yellow-500" },
];

export const LevelProgressTimeline: React.FC<LevelProgressTimelineProps> = ({
  currentLevel,
  progress,
}) => {
  const currentIndex = levels.findIndex((l) => l.name === currentLevel);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6">
        Tu Camino al Éxito
      </h3>
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{
              width: `${(currentIndex / (levels.length - 1)) * 100 + progress / levels.length}%`,
            }}
          />
        </div>

        {/* Level Nodes */}
        <div className="relative flex justify-between">
          {levels.map((level, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isLocked = index > currentIndex;

            return (
              <div
                key={level.name}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`
                    relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                    transition-all duration-500 transform
                    ${isCurrent ? "scale-110 shadow-xl" : ""}
                    ${isCompleted ? level.color + " shadow-lg" : ""}
                    ${isLocked ? "bg-gray-200" : ""}
                    ${isCurrent ? level.color : ""}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-8 w-8 text-white" />
                  ) : (
                    <span
                      className={`text-3xl ${isLocked ? "grayscale opacity-50" : ""}`}
                    >
                      {level.icon}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`text-sm font-bold ${
                      isCurrent
                        ? "text-gray-800"
                        : isCompleted
                          ? "text-gray-600"
                          : "text-gray-400"
                    }`}
                  >
                    {level.name}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">
                      {Math.round(progress)}% completado
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
