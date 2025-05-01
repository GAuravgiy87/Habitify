import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HabitCard from "@/components/dashboard/habit-card";

const Habits = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/habits/all"],
    refetchOnWindowFocus: false,
  });
  
  const allHabits = data?.data || {
    active: [
      {
        id: 1,
        name: "Sleep 8 hours",
        icon: "moon",
        iconBgColor: "bg-blue-100",
        iconColor: "text-blue-500",
        goal: { value: 8, unit: "hours" },
        progress: 7.5,
        status: "completed",
        type: "quantity",
        category: "health"
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
        type: "quantity",
        category: "fitness"
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
        type: "timer",
        category: "mindfulness"
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
        type: "quantity",
        category: "health"
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
        type: "quantity",
        category: "personal"
      }
    ],
    archived: [
      {
        id: 6,
        name: "Learn French",
        icon: "book",
        iconBgColor: "bg-yellow-100",
        iconColor: "text-yellow-500",
        goal: { value: 15, unit: "minutes" },
        progress: 0,
        status: "not-started",
        type: "timer",
        category: "education"
      }
    ]
  };
  
  const filteredActiveHabits = allHabits.active.filter(habit => 
    habit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredArchivedHabits = allHabits.archived.filter(habit => 
    habit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-inter">Habits</h1>
          <p className="text-gray-500 mt-1">Manage and track your habits</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-secondary text-white hover:bg-blue-600">
            <Plus className="h-5 w-5 mr-1" />
            New Habit
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search habits..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={18} />
          Filter
        </Button>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Habits</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Habits ({filteredActiveHabits.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-8 text-center">Loading habits...</div>
              ) : filteredActiveHabits.length > 0 ? (
                <div className="bg-white rounded-lg overflow-hidden">
                  {filteredActiveHabits.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No habits match your search." : "You have no active habits. Add one to get started!"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Archived Habits ({filteredArchivedHabits.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-8 text-center">Loading habits...</div>
              ) : filteredArchivedHabits.length > 0 ? (
                <div className="bg-white rounded-lg overflow-hidden">
                  {filteredArchivedHabits.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No archived habits match your search." : "You have no archived habits."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Habits;
