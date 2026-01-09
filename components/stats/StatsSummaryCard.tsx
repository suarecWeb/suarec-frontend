import { LucideIcon } from "lucide-react";

interface StatsSummaryCardProps {
  icon: LucideIcon;
  value: string | number;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
  valueColor: string;
}

export const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  icon: Icon,
  value,
  title,
  description,
  bgColor,
  iconColor,
  valueColor,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-20 h-20 ${bgColor} rounded-full -mr-10 -mt-10`}
      ></div>
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-xs ${valueColor} font-medium`}>{description}</p>
    </div>
  );
};
