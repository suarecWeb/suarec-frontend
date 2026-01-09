import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Metric {
  label: string;
  current: number;
  previous: number;
  format?: (value: number) => string;
  color?: string;
}

interface MetricsGridProps {
  metrics: Metric[];
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 bg-green-50";
    if (change < 0) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const change = calculateChange(metric.current, metric.previous);
        const formattedCurrent = metric.format
          ? metric.format(metric.current)
          : metric.current;
        const formattedPrevious = metric.format
          ? metric.format(metric.previous)
          : metric.previous;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {metric.label}
              </h4>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full ${getChangeColor(change)}`}
              >
                {getChangeIcon(change)}
                <span className="text-xs font-bold">
                  {Math.abs(change).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {formattedCurrent}
                </p>
                <p className="text-xs text-gray-500 mt-1">Período actual</p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Anterior:{" "}
                  <span className="font-semibold">{formattedPrevious}</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
