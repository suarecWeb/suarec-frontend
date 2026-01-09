import { LucideIcon } from "lucide-react";
import { CircularProgress } from "./CircularProgress";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: number;
  color?: string;
  bgGradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  progress,
  color = "#097EEC",
  bgGradient = "from-blue-50 to-blue-100",
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl bg-white/80 shadow-sm`}>
              <Icon className="h-6 w-6" style={{ color }} />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <div className="mt-3">
            <p className="text-4xl font-bold text-gray-800">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {progress !== undefined && (
          <CircularProgress
            percentage={progress}
            size={80}
            strokeWidth={6}
            color={color}
          />
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/50">
          <span
            className={`flex items-center gap-1 text-sm font-semibold ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "↗" : "↘"}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-600">vs período anterior</span>
        </div>
      )}
    </div>
  );
};
