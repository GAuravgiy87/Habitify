import { Card } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";

interface PerformanceTrendsProps {
  title?: string;
}

const PerformanceTrends = ({ title = "Performance Trends" }: PerformanceTrendsProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/performance"],
    refetchOnWindowFocus: false,
  });
  
  const performanceData = data?.data || {
    categories: ["Exercise", "Sleep", "Nutrition", "Water", "Mindfulness"],
    data: [
      {
        category: "Exercise",
        thisWeek: 85,
        lastWeek: 72
      },
      {
        category: "Sleep",
        thisWeek: 85,
        lastWeek: 72
      },
      {
        category: "Nutrition",
        thisWeek: 85,
        lastWeek: 72
      },
      {
        category: "Water",
        thisWeek: 85,
        lastWeek: 72
      },
      {
        category: "Mindfulness",
        thisWeek: 85,
        lastWeek: 72
      }
    ]
  };
  
  return (
    <Card className="bg-white rounded-lg p-6 shadow-card">
      <h4 className="text-lg font-semibold text-primary font-inter mb-4">{title}</h4>
      
      <div className="w-full h-64 bg-gray-50 rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading performance data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              outerRadius={90} 
              data={performanceData.data}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <Radar 
                name="This week" 
                dataKey="thisWeek" 
                stroke="hsl(var(--secondary))" 
                fill="hsl(var(--secondary))" 
                fillOpacity={0.2} 
              />
              <Radar 
                name="Last week" 
                dataKey="lastWeek" 
                stroke="hsl(var(--accent))" 
                fill="hsl(var(--accent))" 
                fillOpacity={0.2} 
                strokeDasharray="5 3"
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-8">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-600">This week</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-violet-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-600">Last week</span>
        </div>
      </div>
    </Card>
  );
};

export default PerformanceTrends;
