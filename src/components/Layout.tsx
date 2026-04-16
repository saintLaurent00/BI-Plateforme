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
  LogOut,
  Users,
  Users2,
  ShieldCheck,
  Lock,
  Clock,
  Activity,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Key,
  Sun,
  Moon,
  BookOpen
} from 'lucide-react';
import { AIChat } from './AIChat';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Layout = ({ children, onLogout }: { children: React.ReactNode; onLogout?: () => void }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth >= 1024);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isAdminExpanded, setIsAdminExpanded] = React.useState(location.pathname.startsWith('/admin'));
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/dashboards", icon: LayoutDashboard, label: "Dashboards" },
    { to: "/charts", icon: BarChart3, label: "Charts" },
    { to: "/sql-lab", icon: Terminal, label: "SQL Lab" },
    { to: "/datasets", icon: Database, label: "Datasets" },
    { to: "/documentation", icon: BookOpen, label: "Documentation" },
  ];

  const adminItems = [
    { to: "/admin?section=users", icon: Users, label: "Users" },
    { to: "/admin?section=groups", icon: Users2, label: "Groups" },
    { to: "/admin?section=roles", icon: ShieldCheck, label: "Roles" },
    { to: "/admin?section=rls", icon: Lock, label: "RLS Policies" },
    { to: "/admin?section=sessions", icon: Clock, label: "Sessions" },
    { to: "/admin?section=audit", icon: Activity, label: "Governance & Screening" },
    { to: "/admin?section=auth", icon: Key, label: "Authentication" },
    { to: "/admin?section=screening", icon: ShieldCheck, label: "Screening Dashboard" },
    { to: "/admin?section=sources", icon: Database, label: "Data Sources" },
    { to: "/admin?section=security", icon: ShieldAlert, label: "Security" },
    { to: "/admin?section=reports", icon: Bell, label: "Alerts & Reports" },
    { to: "/admin?section=settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to.split('?')[0]);
  };

  const isSubItemActive = (to: string) => {
    return location.pathname + location.search === to;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
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
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium group relative",
                    isActive(item.to) 
                      ? "bg-accent text-accent-foreground shadow-lg shadow-accent/10" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    !isSidebarOpen && "justify-center px-0"
                  )}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <item.icon className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:scale-110", 
                    isActive(item.to) ? "text-accent-foreground" : "text-muted-foreground"
                  )} />
                  {isSidebarOpen && <span>{item.label}</span>}
                  {isActive(item.to) && isSidebarOpen && (
                    <div className="absolute right-3 w-1.5 h-1.5 bg-accent-foreground/30 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Admin Section */}
            <div className="pt-4 mt-4 border-t border-border/50">
              {isSidebarOpen ? (
                <button 
                  onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors group",
                    isAdminExpanded && "text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Administration</span>
                  </div>
                  {isAdminExpanded ? (
                    <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsSidebarOpen(true);
                    setIsAdminExpanded(true);
                  }}
                  className="w-full flex justify-center py-4 text-muted-foreground hover:text-foreground transition-colors"
                  title="Administration"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              )}

              {isAdminExpanded && isSidebarOpen && (
                <div className="mt-1 space-y-0.5 pl-2">
                  {adminItems.map((item) => (
                    <Link 
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 text-xs font-medium group relative",
                        isSubItemActive(item.to)
                          ? "bg-accent/50 text-accent-foreground font-bold" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110", 
                        isSubItemActive(item.to) ? "text-accent-foreground" : "text-muted-foreground"
                      )} />
                      <span>{item.label}</span>
                      {isSubItemActive(item.to) && (
                        <div className="absolute left-0 w-1 h-4 bg-accent rounded-r-full" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-2xl hover:bg-muted transition-all duration-300 group cursor-pointer relative",
              !isSidebarOpen && "justify-center p-0"
            )}>
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border shadow-sm group-hover:ring-4 group-hover:ring-accent/10 transition-all">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">Laurent O.</p>
                  <p className="text-[9px] text-muted-foreground truncate uppercase tracking-[0.2em] font-black">Intelligence Admin</p>
                </div>
              )}
              {isSidebarOpen && (
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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
            <button 
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full border border-background"></span>
            </button>
            <div className="w-px h-4 bg-border mx-1"></div>
            <button 
              onClick={onLogout}
              className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
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
