import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { calculatePercentage, getDayName } from "@/lib/utils";

interface WaterIntakeChartProps {
  title?: string;
}

const WaterIntakeChart = ({ title = "Water Intake" }: WaterIntakeChartProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/water-intake"],
    refetchOnWindowFocus: false,
  });
  
  const addWaterMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/water-intake", { amount: 0.25 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-intake"] });
    }
  });
  
  const waterData = data?.data || {
    today: { current: 1.8, target: 2.5 },
    weekData: [
      { day: "Mon", amount: 1.75 },
      { day: "Tue", amount: 2.25 },
      { day: "Wed", amount: 1.6 },
      { day: "Thu", amount: 2.0 },
      { day: "Fri", amount: 2.5 },
      { day: "Sat", amount: 1.9 },
      { day: "Sun", amount: 1.8 },
    ]
  };
  
  const percentage = calculatePercentage(
    waterData.today.current,
    waterData.today.target
  );
  
  const handleAddWater = () => {
    addWaterMutation.mutate();
  };
  
  return (
    <Card className="bg-white rounded-lg p-6 shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary font-inter">{title}</h3>
        <div className="text-sm text-gray-500">
          Today: {waterData.today.current} / {waterData.today.target} L
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="w-32 h-32 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" />
            
            {/* Progress arc */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="hsl(var(--secondary))" 
              strokeWidth="10" 
              strokeDasharray={`${percentage * 2.83} 360`} 
              strokeDashoffset="0" 
              transform="rotate(-90 50 50)" 
            />
            
            {/* Water drop icon */}
            <path d="M50,25 C50,25 30,50 30,65 C30,80 70,80 70,65 C70,50 50,25 50,25 Z" fill="hsl(var(--secondary))" fillOpacity="0.2" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold text-primary">{percentage}%</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mt-4">
        {waterData.weekData.map((day, index) => {
          const dayPercentage = calculatePercentage(day.amount, waterData.today.target);
          return (
            <div key={index} className="flex flex-col items-center">
              <div className="h-20 w-6 bg-gray-100 rounded-full relative overflow-hidden">
                <div
                  className="absolute bottom-0 w-full bg-blue-400 rounded-b-full"
                  style={{ height: `${dayPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">{day.day}</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4">
        <Button 
          variant="ghost" 
          className="text-secondary text-sm font-medium"
          onClick={handleAddWater}
          disabled={addWaterMutation.isPending}
        >
          <Plus className="h-5 w-5 mr-1" />
          Add water
        </Button>
      </div>
    </Card>
  );
};

export default WaterIntakeChart;
