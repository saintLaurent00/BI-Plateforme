import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Database, 
  Terminal, 
  Home, 
  Settings, 
  Search, 
  Bell, 
  Plus,
  Menu,
  X,
  MessageSquare,
  Sparkles,
  Command,
  LogOut
} from 'lucide-react';
import { AIChat } from './AIChat';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/dashboards", icon: LayoutDashboard, label: "Dashboards" },
    { to: "/charts", icon: BarChart3, label: "Charts" },
    { to: "/sql-lab", icon: Terminal, label: "SQL Lab" },
    { to: "/datasets", icon: Database, label: "Datasets" },
    { to: "/admin", icon: Settings, label: "Admin" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center px-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center transition-all group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-accent/10">
                <Command className="w-4 h-4 text-accent-foreground" />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="font-bold tracking-tight text-lg leading-none">Prism</span>
                  <span className="text-[10px] text-muted-foreground font-serif italic tracking-wide">Intelligence</span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link 
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium group relative",
                  location.pathname === item.to 
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/10" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  !isSidebarOpen && "justify-center px-0"
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <item.icon className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110", 
                  location.pathname === item.to ? "text-accent-foreground" : "text-muted-foreground"
                )} />
                {isSidebarOpen && <span>{item.label}</span>}
                {location.pathname === item.to && isSidebarOpen && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-accent-foreground/30 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-2xl hover:bg-muted transition-all duration-300 group cursor-pointer relative",
              !isSidebarOpen && "justify-center p-0"
            )}>
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm group-hover:ring-4 group-hover:ring-accent/10 transition-all">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Laurent O.</p>
                  <p className="text-[9px] text-muted-foreground truncate uppercase tracking-[0.2em] font-black">Intelligence Admin</p>
                </div>
              )}
              {isSidebarOpen && (
                <button 
                  onClick={() => console.log('Logging out...')}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative flex-1 max-w-md group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-1.5 bg-muted/30 border border-transparent focus:bg-background focus:border-border rounded-md text-sm transition-all outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-medium text-muted-foreground">
                <span className="text-[8px]">⌘</span>K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full border border-background"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="w-full h-full">
            {children}
          </div>
        </main>

        {/* AI Chat Toggle */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "fixed bottom-6 right-6 z-40 w-10 h-10 rounded-md shadow-sm border border-border flex items-center justify-center transition-all active:scale-95 group overflow-hidden bg-background hover:bg-muted",
            isChatOpen && "rotate-90 bg-foreground text-background border-foreground"
          )}
        >
          {isChatOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </button>

        {/* AI Chat Dialog */}
        <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  );
};
