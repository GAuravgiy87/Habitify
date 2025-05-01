import { Link, useLocation } from "wouter";
import { Home, CheckSquare, BarChart2, Settings } from "lucide-react";

const MobileNav = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 h-16">
        <Link href="/dashboard">
          <a className={`flex flex-col items-center justify-center ${isActive('/dashboard') || isActive('/') ? 'text-secondary' : 'text-gray-500'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/habits">
          <a className={`flex flex-col items-center justify-center ${isActive('/habits') ? 'text-secondary' : 'text-gray-500'}`}>
            <CheckSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Habits</span>
          </a>
        </Link>
        <Link href="/analytics">
          <a className={`flex flex-col items-center justify-center ${isActive('/analytics') ? 'text-secondary' : 'text-gray-500'}`}>
            <BarChart2 className="h-6 w-6" />
            <span className="text-xs mt-1">Analytics</span>
          </a>
        </Link>
        <Link href="/settings">
          <a className={`flex flex-col items-center justify-center ${isActive('/settings') ? 'text-secondary' : 'text-gray-500'}`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
