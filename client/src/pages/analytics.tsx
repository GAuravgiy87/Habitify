import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import HabitProgressChart from "@/components/dashboard/habit-progress-chart";
import SleepChart from "@/components/dashboard/sleep-chart";
import WaterIntakeChart from "@/components/dashboard/water-intake-chart";
import ScreenTimeChart from "@/components/dashboard/screen-time-chart";
import PerformanceTrends from "@/components/dashboard/performance-trends";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = new Date(currentDate);
    start.setDate(start.getDate() - 6);
    
    return `${start.toLocaleDateString('en-US', options)} - ${currentDate.toLocaleDateString('en-US', options)}`;
  };
  
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (timeRange === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (timeRange === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };
  
  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (timeRange === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (timeRange === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-inter">Analytics</h1>
          <p className="text-gray-500 mt-1">Your habit and wellness insights</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="flex items-center mr-4">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="mx-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{formatDateRange()}</span>
            </div>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
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
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <HabitProgressChart />
            <SleepChart />
            <WaterIntakeChart />
            <ScreenTimeChart />
            <div className="md:col-span-2">
              <PerformanceTrends title="Overall Performance" />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="habits">
          <Card>
            <CardHeader>
              <CardTitle>Habit Completion Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <HabitProgressChart title="Habit Completion Rate" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="health">
          <div className="grid gap-6 md:grid-cols-2">
            <SleepChart title="Sleep Analysis" />
            <WaterIntakeChart title="Hydration Tracking" />
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <PerformanceTrends title="Category Performance" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
