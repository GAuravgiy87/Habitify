import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { calculatePercentage } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Moon, 
  Zap, 
  Timer, 
  Droplets, 
  BookOpen 
} from "lucide-react";

interface HabitCardProps {
  habit: {
    id: number;
    name: string;
    icon: string;
    iconBgColor: string;
    iconColor: string;
    goal: {
      value: number;
      unit: string;
    };
    progress: number;
    status: "completed" | "in-progress" | "not-started";
    type: "boolean" | "counter" | "timer" | "quantity";
  };
}

const HabitCard = ({ habit }: HabitCardProps) => {
  const [progress, setProgress] = useState(habit.progress);
  
  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: number) => {
      return apiRequest("PATCH", `/api/habits/${habit.id}/progress`, { progress: newProgress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    }
  });
  
  const toggleCompletionMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      return apiRequest("PATCH", `/api/habits/${habit.id}/toggle`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    }
  });
  
  const checkInMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/habits/${habit.id}/check-in`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    }
  });
  
  const renderIcon = () => {
    switch (habit.icon) {
      case "moon":
        return <Moon className="h-6 w-6" />;
      case "zap":
        return <Zap className="h-6 w-6" />;
      case "timer":
        return <Timer className="h-6 w-6" />;
      case "droplets":
        return <Droplets className="h-6 w-6" />;
      case "book":
        return <BookOpen className="h-6 w-6" />;
      default:
        return <Moon className="h-6 w-6" />;
    }
  };
  
  const handleProgressChange = (newValue: number[]) => {
    const value = newValue[0];
    setProgress(value);
    updateProgressMutation.mutate(value);
  };
  
  const handleToggleChange = (checked: boolean) => {
    toggleCompletionMutation.mutate(checked);
  };
  
  const handleCheckIn = () => {
    checkInMutation.mutate();
  };
  
  const percentage = calculatePercentage(
    progress,
    habit.goal.value
  );
  
  const renderProgressInput = () => {
    if (habit.type === "boolean") {
      return (
        <Switch
          checked={habit.status === "completed"}
          onCheckedChange={handleToggleChange}
        />
      );
    }
    
    if (habit.type === "quantity" && habit.name.toLowerCase().includes("water")) {
      return (
        <div className="mt-2 flex space-x-1">
          {Array.from({ length: 8 }).map((_, index) => {
            const glassNumber = index + 1;
            const isCompleted = progress >= glassNumber;
            
            return (
              <button 
                key={index}
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isCompleted ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-400"
                }`}
                onClick={() => handleProgressChange([glassNumber])}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  glassNumber
                )}
              </button>
            );
          })}
        </div>
      );
    }
    
    return (
      <div className="flex items-center">
        <Slider
          value={[progress]}
          max={habit.goal.value}
          step={1}
          className="w-32 mr-2"
          onValueChange={handleProgressChange}
        />
        <span>{progress} {habit.goal.unit}</span>
      </div>
    );
  };
  
  let statusText;
  if (habit.status === "completed") {
    statusText = <span className="text-sm text-success">Completed</span>;
  } else if (habit.status === "in-progress") {
    statusText = <div className="text-sm text-gray-500">{progress}/{habit.goal.value} {habit.goal.unit}</div>;
  } else {
    statusText = (
      <Button
        variant="ghost"
        size="sm"
        className="text-sm text-secondary font-medium"
        onClick={handleCheckIn}
        disabled={checkInMutation.isPending}
      >
        Check-in
      </Button>
    );
  }
  
  return (
    <div className={`p-4 border-b border-gray-100 ${habit.id % 2 === 0 ? 'bg-gray-50' : ''}`}>
      <div className="flex items-center">
        <div className="mr-4">
          <div className={`w-10 h-10 ${habit.iconBgColor} rounded-full flex items-center justify-center ${habit.iconColor}`}>
            {renderIcon()}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-primary">{habit.name}</h4>
            {statusText}
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>Goal: {habit.goal.value} {habit.goal.unit}</span>
              {habit.type !== "boolean" && (
                renderProgressInput()
              )}
            </div>
            <div className="habit-progress-bar">
              <div 
                className={`habit-progress-value ${
                  habit.status === "completed" 
                    ? "bg-success" 
                    : habit.name.toLowerCase().includes("water") 
                      ? "bg-blue-400" 
                      : habit.name.toLowerCase().includes("read") 
                        ? "bg-red-400" 
                        : "bg-secondary"
                }`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
