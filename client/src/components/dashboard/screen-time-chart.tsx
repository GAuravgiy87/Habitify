import { Card } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { formatTime } from "@/lib/utils";

interface ScreenTimeChartProps {
  title?: string;
}

const ScreenTimeChart = ({ title = "Screen Time" }: ScreenTimeChartProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/screen-time"],
    refetchOnWindowFocus: false,
  });
  
  const screenTimeData = data?.data || {
    dailyAverage: 192, // in minutes
    weekData: [
      { day: "Mon", minutes: 180 },
      { day: "Tue", minutes: 210 },
      { day: "Wed", minutes: 165 },
      { day: "Thu", minutes: 240 },
      { day: "Fri", minutes: 190 },
      { day: "Sat", minutes: 260 },
      { day: "Sun", minutes: 195 },
    ],
    mostUsed: [
      { app: "Instagram", minutes: 72 },
      { app: "Twitter", minutes: 45 },
      { app: "YouTube", minutes: 32 },
    ]
  };
  
  const colors = {
    instagram: "bg-blue-500",
    twitter: "bg-green-500",
    youtube: "bg-yellow-500",
  };
  
  return (
    <Card className="bg-white rounded-lg p-6 shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary font-inter">{title}</h3>
        <div className="text-sm text-gray-500">
          Daily avg: {formatTime(screenTimeData.dailyAverage)}
        </div>
      </div>
      
      <div className="w-full h-60 bg-gray-50 rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={screenTimeData.weekData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => `${Math.floor(value / 60)}h`}
                width={30}
              />
              <Tooltip 
                formatter={(value) => [formatTime(Number(value)), 'Screen Time']}
                contentStyle={{ 
                  borderRadius: '0.375rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '0.5rem',
                  backgroundColor: 'white'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="minutes" 
                stroke="hsl(var(--accent))" 
                fillOpacity={0.2}
                fill="url(#colorTime)" 
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--accent))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <div>
          <div className="font-medium">Most used apps</div>
          <div className="mt-2">
            {screenTimeData.mostUsed.map((app, index) => {
              const bgColor = colors[app.app.toLowerCase() as keyof typeof colors] || "bg-gray-500";
              
              return (
                <div key={index} className="flex items-center mb-1">
                  <span className={`w-3 h-3 rounded-sm ${bgColor} mr-2`}></span>
                  <span>{app.app}</span>
                  <span className="ml-auto">{formatTime(app.minutes)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScreenTimeChart;
