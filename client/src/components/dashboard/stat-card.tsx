import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const StatCard = ({
  title,
  value,
  subValue,
  icon,
  iconBgColor,
  iconColor,
}: StatCardProps) => {
  return (
    <Card className="bg-white rounded-lg p-6 shadow-card">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-gray-500">{title}</h2>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-primary">{value}</p>
            {subValue && <p className="ml-2 text-sm text-success">{subValue}</p>}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
