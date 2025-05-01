import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useQuery } from "@tanstack/react-query";

interface SleepChartProps {
  title?: string;
}

const SleepChart = ({ title = "Sleep Patterns" }: SleepChartProps) => {
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/sleep", timeRange],
    refetchOnWindowFocus: false,
  });
  
  const chartData = data?.data || [
    { day: "Mon", duration: 7, quality: 6 },
    { day: "Tue", duration: 8, quality: 8 },
    { day: "Wed", duration: 7.5, quality: 7 },
    { day: "Thu", duration: 8.5, quality: 9 },
    { day: "Fri", duration: 8, quality: 8 },
    { day: "Sat", duration: 7.5, quality: 9 },
    { day: "Sun", duration: 8, quality: 8 },
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
            <ComposedChart
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
                domain={[4, 10]}
                tickFormatter={(value) => `${value}h`}
                width={30}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${value}${name === 'duration' ? 'h' : '/10'}`, 
                  name === 'duration' ? 'Duration' : 'Quality'
                ]}
                contentStyle={{ 
                  borderRadius: '0.375rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '0.5rem',
                  backgroundColor: 'white'
                }}
              />
              <Bar 
                dataKey="duration" 
                fill="hsl(var(--secondary))" 
                fillOpacity={0.3} 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
              <Line 
                type="monotone" 
                dataKey="quality" 
                stroke="hsl(var(--accent))" 
                strokeWidth={3} 
                dot={{ r: 5, fill: "hsl(var(--accent))" }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default SleepChart;
