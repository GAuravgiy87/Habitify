import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Zap, Moon, Clock, Droplets } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import HabitProgressChart from "@/components/dashboard/habit-progress-chart";
import SleepChart from "@/components/dashboard/sleep-chart";
import WaterIntakeChart from "@/components/dashboard/water-intake-chart";
import ScreenTimeChart from "@/components/dashboard/screen-time-chart";
import HabitCard from "@/components/dashboard/habit-card";
import StreakCalendar from "@/components/dashboard/streak-calendar";
import PerformanceTrends from "@/components/dashboard/performance-trends";

const Dashboard = () => {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchOnWindowFocus: false,
  });
  
  const { data: habitsData, isLoading: isLoadingHabits } = useQuery({
    queryKey: ["/api/habits"],
    refetchOnWindowFocus: false,
  });
  
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  
  const stats = statsData?.data || {
    completed: { value: "5/8", percentage: "62%" },
    streak: { value: "12", unit: "days" },
    sleep: { value: "Good", time: "7.5h" },
    screenTime: { value: "3h 45m", trend: "+20%" }
  };
  
  const habits = habitsData?.data || [
    {
      id: 1,
      name: "Sleep 8 hours",
      icon: "moon",
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-500",
      goal: { value: 8, unit: "hours" },
      progress: 7.5,
      status: "completed",
      type: "quantity"
    },
    {
      id: 2,
      name: "Exercise",
      icon: "zap",
      iconBgColor: "bg-green-100",
      iconColor: "text-green-500",
      goal: { value: 30, unit: "minutes" },
      progress: 45,
      status: "completed",
      type: "quantity"
    },
    {
      id: 3,
      name: "Meditate",
      icon: "timer",
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-500",
      goal: { value: 20, unit: "minutes" },
      progress: 0,
      status: "not-started",
      type: "timer"
    },
    {
      id: 4,
      name: "Drink Water",
      icon: "droplets",
      iconBgColor: "bg-cyan-100",
      iconColor: "text-cyan-500",
      goal: { value: 8, unit: "glasses" },
      progress: 5,
      status: "in-progress",
      type: "quantity"
    },
    {
      id: 5,
      name: "Read a book",
      icon: "book",
      iconBgColor: "bg-red-100",
      iconColor: "text-red-500",
      goal: { value: 30, unit: "pages" },
      progress: 15,
      status: "in-progress",
      type: "quantity"
    }
  ];
  
  return (
    <div id="dashboard">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-inter">Dashboard</h1>
          <p className="text-gray-500 mt-1">{formatDate(new Date())}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-secondary text-white hover:bg-blue-600">
            <Plus className="h-5 w-5 mr-1" />
            Add Habit
          </Button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Habits Completed"
          value={stats.completed.value}
          subValue={stats.completed.percentage}
          icon={<CheckCircle className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-secondary"
        />
        
        <StatCard
          title="Current Streak"
          value={stats.streak.value}
          subValue={stats.streak.unit}
          icon={<Zap className="h-6 w-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-success"
        />
        
        <StatCard
          title="Sleep Quality"
          value={stats.sleep.value}
          subValue={stats.sleep.time}
          icon={<Moon className="h-6 w-6" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-accent"
        />
        
        <StatCard
          title="Screen Time"
          value={stats.screenTime.value}
          subValue={stats.screenTime.trend}
          icon={<Clock className="h-6 w-6" />}
          iconBgColor="bg-cyan-100"
          iconColor="text-cyan-600"
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <HabitProgressChart />
        <SleepChart />
      </div>
      
      {/* Smaller Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <WaterIntakeChart />
        <ScreenTimeChart />
      </div>
      
      {/* Today's Habits */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-primary font-inter">Today's Habits</h3>
          <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-gray-700">
            View All
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          {isLoadingHabits ? (
            <div className="p-8 text-center">Loading habits...</div>
          ) : (
            habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))
          )}
        </div>
      </div>
      
      {/* Streaks and Performance */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-primary font-inter">Streaks & Performance</h3>
          <div className="flex space-x-2">
            <Button 
              variant={timeRange === "week" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setTimeRange("week")}
              className="text-sm"
            >
              Week
            </Button>
            <Button 
              variant={timeRange === "month" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setTimeRange("month")}
              className="text-sm"
            >
              Month
            </Button>
            <Button 
              variant={timeRange === "year" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setTimeRange("year")}
              className="text-sm"
            >
              Year
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StreakCalendar />
          <PerformanceTrends />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
