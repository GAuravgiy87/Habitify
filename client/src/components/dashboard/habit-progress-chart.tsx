import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";

interface HabitProgressChartProps {
  title?: string;
}

const HabitProgressChart = ({ title = "Weekly Progress" }: HabitProgressChartProps) => {
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/progress", timeRange],
    refetchOnWindowFocus: false,
  });
  
  const chartData = data?.data || [
    { day: "Mon", progress: 60 },
    { day: "Tue", progress: 75 },
    { day: "Wed", progress: 35 },
    { day: "Thu", progress: 70 },
    { day: "Fri", progress: 90 },
    { day: "Sat", progress: 45 },
    { day: "Sun", progress: 65 },
  ];
  
  return (
    <Card className="bg-white rounded-lg p-6 shadow-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-primary font-inter">{title}</h3>
        <div className="flex items-center space-x-2">
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
        </div>
      </div>
      
      <div className="w-full h-64 bg-gray-50 rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="day" 
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Progress']}
                contentStyle={{ 
                  borderRadius: '0.375rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '0.5rem',
                  backgroundColor: 'white'
                }}
              />
              <Bar 
                dataKey="progress" 
                fill="hsl(var(--secondary))" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default HabitProgressChart;
