import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { formatDate, formatTime, calculatePercentage, getDayName, getDateRange } from "./lib/utils";
import { useToast } from "./hooks/use-toast";
import { useMobile } from "./hooks/use-mobile";
import { cn } from "./lib/utils";
import {
  Moon,
  Sun,
  Bell,
  Plus,
  CheckCircle,
  Zap,
  Clock,
  Droplets,
  Home,
  CheckSquare,
  BarChart2,
  Settings as SettingsIcon,
  Facebook,
  Twitter,
  Instagram,
  Github
} from "lucide-react";

// Initialize the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Theme context
type Theme = "light" | "dark";
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({ 
  theme: "light", 
  toggleTheme: () => {}
});

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem("habitify-theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // Use system preference if no saved preference
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    // Update the class on the document element when theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save to localStorage
    localStorage.setItem("habitify-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// Button Component
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
};

const Button = ({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
  };
  
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md text-sm",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
};

// Avatar Component
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

const Avatar = ({ className, src, alt, fallback, ...props }: AvatarProps) => {
  return (
    <div className={cn("relative h-10 w-10 rounded-full", className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground">
          {fallback || "U"}
        </div>
      )}
    </div>
  );
};

// Header Component
const Header = () => {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications"
    });
  };
  
  const handleProfileClick = () => {
    toast({
      title: "Profile",
      description: "User profile coming soon"
    });
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0">
                <span className="text-primary dark:text-white font-inter font-bold text-xl">Habitify</span>
              </div>
            </Link>
            <nav className="hidden md:ml-8 md:flex space-x-8">
              <Link href="/dashboard">
                <div className={`px-3 py-2 text-sm font-medium ${isActive('/dashboard') || isActive('/') ? 'text-secondary dark:text-blue-400' : 'text-foreground dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400'}`}>
                  Dashboard
                </div>
              </Link>
              <Link href="/habits">
                <div className={`px-3 py-2 text-sm font-medium ${isActive('/habits') ? 'text-secondary dark:text-blue-400' : 'text-foreground dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400'}`}>
                  Habits
                </div>
              </Link>
              <Link href="/analytics">
                <div className={`px-3 py-2 text-sm font-medium ${isActive('/analytics') ? 'text-secondary dark:text-blue-400' : 'text-foreground dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400'}`}>
                  Analytics
                </div>
              </Link>
              <Link href="/settings">
                <div className={`px-3 py-2 text-sm font-medium ${isActive('/settings') ? 'text-secondary dark:text-blue-400' : 'text-foreground dark:text-gray-300 hover:text-secondary dark:hover:text-blue-400'}`}>
                  Settings
                </div>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button 
              onClick={handleNotificationClick}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="relative flex-shrink-0">
              <button 
                type="button" 
                onClick={handleProfileClick}
                className="bg-gray-100 dark:bg-gray-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary dark:ring-offset-gray-900"
              >
                <span className="sr-only">Open user menu</span>
                <Avatar 
                  className="h-8 w-8"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="User profile"
                  fallback="JD"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Mobile Navigation Component
const MobileNav = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="grid grid-cols-4 h-16">
        <Link href="/dashboard">
          <div className={`flex flex-col items-center justify-center ${isActive('/dashboard') || isActive('/') ? 'text-secondary dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </div>
        </Link>
        <Link href="/habits">
          <div className={`flex flex-col items-center justify-center ${isActive('/habits') ? 'text-secondary dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <CheckSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Habits</span>
          </div>
        </Link>
        <Link href="/analytics">
          <div className={`flex flex-col items-center justify-center ${isActive('/analytics') ? 'text-secondary dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <BarChart2 className="h-6 w-6" />
            <span className="text-xs mt-1">Analytics</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className={`flex flex-col items-center justify-center ${isActive('/settings') ? 'text-secondary dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <SettingsIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  const { toast } = useToast();
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    e.preventDefault();
    toast({
      title: "Coming Soon",
      description: `${label} will be available soon!`
    });
  };

  return (
    <footer className="bg-primary dark:bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="text-lg font-bold mb-4 font-inter">Habitify</h5>
            <p className="text-gray-300 text-sm">Track your habits, improve your health, and reach your goals with our comprehensive wellness platform.</p>
          </div>
          <div>
            <h5 className="text-md font-semibold mb-4 font-inter">Features</h5>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/habits"><div className="hover:text-white cursor-pointer">Habit Tracking</div></Link></li>
              <li><Link href="/analytics"><div className="hover:text-white cursor-pointer">Health Analytics</div></Link></li>
              <li><Link href="/dashboard"><div className="hover:text-white cursor-pointer">Goal Setting</div></Link></li>
              <li><Link href="/analytics"><div className="hover:text-white cursor-pointer">Progress Reports</div></Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-md font-semibold mb-4 font-inter">Resources</h5>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" onClick={(e) => handleLinkClick(e, "Blog")} className="hover:text-white cursor-pointer">Blog</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, "Guides")} className="hover:text-white cursor-pointer">Guides</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, "Support")} className="hover:text-white cursor-pointer">Support</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, "API")} className="hover:text-white cursor-pointer">API</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-md font-semibold mb-4 font-inter">Company</h5>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" onClick={(e) => handleLinkClick(e, "About Us")} className="hover:text-white cursor-pointer">About Us</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, "Careers")} className="hover:text-white cursor-pointer">Careers</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, "Privacy Policy")} className="hover:text-white cursor-pointer">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, "Terms of Service")} className="hover:text-white cursor-pointer">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Habitify. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" onClick={(e) => handleLinkClick(e, "Facebook")} className="text-gray-400 hover:text-white">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, "Twitter")} className="text-gray-400 hover:text-white">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, "Instagram")} className="text-gray-400 hover:text-white">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, "Github")} className="text-gray-400 hover:text-white">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const StatCard = ({
  title,
  value,
  subValue,
  icon,
  iconBgColor,
  iconColor,
}: StatCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-primary dark:text-white">
              {value}
            </p>
            {subValue && (
              <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{subValue}</p>
            )}
          </div>
        </div>
        <div className={`${iconBgColor} p-2 rounded-full`}>
          <span className={`${iconColor}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

// Habit Card Component
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
  const [localProgress, setLocalProgress] = useState(habit.progress);
  const { toast } = useToast();
  
  const percentage = calculatePercentage(localProgress, habit.goal.value);
  
  const statusColor = {
    "completed": "bg-success",
    "in-progress": "bg-blue-500",
    "not-started": "bg-gray-200 dark:bg-gray-700"
  };
  
  const handleMarkComplete = () => {
    setLocalProgress(habit.goal.value);
    toast({
      title: "Habit Completed",
      description: `You've completed ${habit.name} for today!`
    });
  };
  
  const handleIncrement = () => {
    if (localProgress < habit.goal.value) {
      setLocalProgress(prev => Math.min(prev + 1, habit.goal.value));
    }
    if (localProgress + 1 >= habit.goal.value) {
      toast({
        title: "Habit Completed",
        description: `You've reached your goal of ${habit.goal.value} ${habit.goal.unit} for ${habit.name}!`
      });
    }
  };
  
  const handleDecrement = () => {
    setLocalProgress(prev => Math.max(prev - 1, 0));
  };
  
  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${habit.iconBgColor} p-2 rounded-full w-10 h-10 flex items-center justify-center`}>
            <span className={`${habit.iconColor}`}>
              {habit.icon === "moon" && <Moon className="h-5 w-5" />}
              {habit.icon === "zap" && <Zap className="h-5 w-5" />}
              {habit.icon === "timer" && <Clock className="h-5 w-5" />}
              {habit.icon === "droplets" && <Droplets className="h-5 w-5" />}
              {habit.icon === "book" && <CheckSquare className="h-5 w-5" />}
            </span>
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-medium text-primary dark:text-white">{habit.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {localProgress} / {habit.goal.value} {habit.goal.unit}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {habit.type === "quantity" && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDecrement}
                className="h-8 w-8 p-0"
                disabled={localProgress <= 0}
              >
                -
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleIncrement}
                className="h-8 w-8 p-0"
                disabled={localProgress >= habit.goal.value}
              >
                +
              </Button>
            </div>
          )}
          {habit.type === "boolean" && (
            <Button 
              variant={percentage >= 100 ? "secondary" : "outline"}
              size="sm"
              onClick={handleMarkComplete}
              disabled={percentage >= 100}
            >
              {percentage >= 100 ? "Completed" : "Mark Complete"}
            </Button>
          )}
        </div>
      </div>
      <div className="mt-2">
        <div className="habit-progress-bar">
          <div 
            className={`habit-progress-value ${statusColor[habit.status]}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Chart Placeholder Component
interface ChartPlaceholderProps {
  title: string;
  height?: string;
}

const ChartPlaceholder = ({ title, height = "h-64" }: ChartPlaceholderProps) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${height}`}>
      <h3 className="text-lg font-semibold mb-4 font-inter text-primary dark:text-white">{title}</h3>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Chart data will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

// Not Found Page Component
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold text-primary dark:text-white font-inter mb-4">404</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">The page you're looking for doesn't exist.</p>
      <Link href="/">
        <Button variant="secondary">Go to Dashboard</Button>
      </Link>
    </div>
  );
};

// Dashboard Page Component
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
  const { toast } = useToast();
  
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

  const handleAddHabit = () => {
    toast({
      title: "Add Habit",
      description: "The habit creation form will be available soon!"
    });
  };

  const handleViewAllHabits = () => {
    // Navigate to habits page
    window.location.href = "/habits";
  };
  
  return (
    <div id="dashboard" className="animate-in fade-in duration-500">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-white font-inter">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{formatDate(new Date())}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-secondary dark:bg-blue-600 text-white hover:bg-blue-600" onClick={handleAddHabit}>
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
        <ChartPlaceholder title="Habit Progress" />
        <ChartPlaceholder title="Sleep Patterns" />
      </div>
      
      {/* Smaller Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartPlaceholder title="Water Intake" />
        <ChartPlaceholder title="Screen Time" />
      </div>
      
      {/* Today's Habits */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-primary dark:text-white font-inter">Today's Habits</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={handleViewAllHabits}
          >
            View All
          </Button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {isLoadingHabits ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading habits...</p>
            </div>
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
          <h3 className="text-xl font-semibold text-primary dark:text-white font-inter">Streaks & Performance</h3>
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
          <ChartPlaceholder title="Current Streaks" />
          <ChartPlaceholder title="Performance Trends" />
        </div>
      </div>
    </div>
  );
};

// Habits Page Placeholder
const Habits = () => {
  const { toast } = useToast();

  const handleAddHabit = () => {
    toast({
      title: "Add Habit",
      description: "The habit creation form will be available soon!"
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-white font-inter">Habits</h1>
        <Button className="bg-secondary dark:bg-blue-600 text-white hover:bg-blue-600" onClick={handleAddHabit}>
          <Plus className="h-5 w-5 mr-1" />
          Add Habit
        </Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">All your habits will be displayed here.</p>
      </div>
    </div>
  );
};

// Analytics Page Placeholder
const Analytics = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-white font-inter mb-8">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartPlaceholder title="Habit Completion Rate" />
        <ChartPlaceholder title="Sleep Quality" />
        <ChartPlaceholder title="Water Intake Trends" />
        <ChartPlaceholder title="Screen Time Analysis" />
      </div>
    </div>
  );
};

// Settings Page Placeholder
const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully."
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-white font-inter mb-8">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-primary dark:text-white font-inter mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-primary dark:text-white">Dark Mode</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleTheme}
              className={`inline-flex h-10 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ${theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </button>
            <button 
              onClick={toggleTheme}
              className={`inline-flex h-10 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ${theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-primary dark:text-white font-inter mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-primary dark:text-white">Email Notifications</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your habits</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
              <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-400" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-primary dark:text-white">Push Notifications</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications for reminders</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-secondary">
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-primary dark:text-white font-inter mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value="user@example.com" 
              disabled
              className="border border-gray-300 dark:border-gray-600 rounded-md w-full p-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <button className="text-sm text-secondary dark:text-blue-400 font-medium">Change Password</button>
          </div>
        </div>
        <div className="mt-6">
          <Button variant="secondary" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

// Router Component
function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/habits" component={Habits} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Toast Component
interface ToastProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

const Toast = ({ title, description, action }: ToastProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-4 max-w-md">
        {title && <h4 className="text-sm font-semibold text-primary dark:text-white mb-1">{title}</h4>}
        {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
};

// Toaster Component
const Toaster = () => {
  return null; // This would normally contain the toast management
};

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900 text-foreground dark:text-gray-100">
          <Header />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-20 md:mb-6 flex-grow">
            <Router />
          </main>
          <MobileNav />
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;