import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Moon, Zap, Droplets } from "lucide-react";

interface StreakCalendarProps {
  title?: string;
}

const StreakCalendar = ({ title = "Current Streaks" }: StreakCalendarProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/streaks"],
    refetchOnWindowFocus: false,
  });
  
  const streakData = data?.data || [
    {
      id: 1,
      habitName: "Exercise",
      icon: "zap",
      iconBgColor: "bg-green-100",
      iconColor: "text-green-500",
      streak: 12,
      goal: "30 minutes daily",
    },
    {
      id: 2,
      habitName: "Sleep Schedule",
      icon: "moon",
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-500",
      streak: 8,
      goal: "8 hours nightly",
    },
    {
      id: 3,
      habitName: "Water Intake",
      icon: "droplets",
      iconBgColor: "bg-cyan-100",
      iconColor: "text-cyan-500",
      streak: 5,
      goal: "2L daily",
    },
  ];
  
  const renderIcon = (icon: string) => {
    switch (icon) {
      case "moon":
        return <Moon className="h-6 w-6" />;
      case "zap":
        return <Zap className="h-6 w-6" />;
      case "droplets":
        return <Droplets className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };
  
  return (
    <Card className="bg-white rounded-lg p-6 shadow-card">
      <h4 className="text-lg font-semibold text-primary font-inter mb-4">{title}</h4>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p>Loading streak data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {streakData.map((streak) => (
            <div key={streak.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-10 h-10 ${streak.iconBgColor} rounded-full flex items-center justify-center ${streak.iconColor} mr-3`}>
                  {renderIcon(streak.icon)}
                </div>
                <div>
                  <h5 className="font-medium text-primary">{streak.habitName}</h5>
                  <div className="text-sm text-gray-500">{streak.goal}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-success">{streak.streak}</div>
                <div className="text-sm text-gray-500">days</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default StreakCalendar;
