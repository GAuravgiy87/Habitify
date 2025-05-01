import { Link, useLocation } from "wouter";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0">
                <span className="text-primary font-inter font-bold text-xl">Habitify</span>
              </a>
            </Link>
            <nav className="hidden md:ml-8 md:flex space-x-8">
              <Link href="/dashboard">
                <a className={`px-3 py-2 text-sm font-medium ${isActive('/dashboard') || isActive('/') ? 'text-secondary' : 'text-text hover:text-secondary'}`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/habits">
                <a className={`px-3 py-2 text-sm font-medium ${isActive('/habits') ? 'text-secondary' : 'text-text hover:text-secondary'}`}>
                  Habits
                </a>
              </Link>
              <Link href="/analytics">
                <a className={`px-3 py-2 text-sm font-medium ${isActive('/analytics') ? 'text-secondary' : 'text-text hover:text-secondary'}`}>
                  Analytics
                </a>
              </Link>
              <Link href="/settings">
                <a className={`px-3 py-2 text-sm font-medium ${isActive('/settings') ? 'text-secondary' : 'text-text hover:text-secondary'}`}>
                  Settings
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>
            <div className="ml-4 relative flex-shrink-0">
              <div>
                <button type="button" className="bg-gray-100 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                  <span className="sr-only">Open user menu</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
