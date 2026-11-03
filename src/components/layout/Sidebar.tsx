import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Calendar,
  Trophy,
  BarChart3,
  Bell,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  UserCircle,
  UserCog,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import logo from "../../assets/CircPr-logo.png";
import { useThemeStore } from "../../store/useThemeStore";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/players", label: "Players", icon: Users },
  { path: "/teams", label: "Teams", icon: UsersRound },
  { path: "/matches", label: "Matches", icon: Calendar },
  { path: "/tournaments", label: "Tournaments", icon: Trophy },
  { path: "/stats", label: "Stats", icon: BarChart3 },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/scoring-error-reports", label: "Error Reports", icon: AlertTriangle },
  { path: "/add-manager", label: "Ads Config", icon: UserCog },
];

export function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  
  // Use dark logo for dark mode, regular logo for light mode
  const logoSrc = theme === 'dark' ? '/logo_dark.png' : logo;

  const handleLogout = () => {
    logout();
    if (isMobile) {
      onToggle();
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-borderShadcn/50 bg-card shadow-lg backdrop-blur-sm">
      {/* Logo Section */}
      <div className="flex h-16 sm:h-20 items-center justify-between border-b border-borderShadcn/50 px-4 sm:px-6 bg-gradient-to-r from-primary/5 to-transparent">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group min-w-0 flex-1"
        >
          <div className="relative flex-shrink-0">
            <img
              src={logoSrc}
              alt="CricPR Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            onClick={isMobile ? onToggle : undefined}
            className={cn(
              "p-2 rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
              location.pathname === "/profile" && "bg-primary/10 text-primary"
            )}
            title="Profile"
          >
            <UserCircle className="h-5 w-5" />
          </Link>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 sm:space-y-2 p-3 sm:p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" &&
              location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={isMobile ? onToggle : undefined}
              className={cn(
                "group flex items-center gap-3 sm:gap-4 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-200 relative overflow-hidden min-w-0",
                isActive
                  ? "bg-primary-button-gradient text-white shadow-lg shadow-primary/30 scale-[1.02]"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:scale-[1.01]"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 relative z-10 transition-transform duration-200 flex-shrink-0",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground group-hover:text-accent-foreground group-hover:scale-110"
                )}
              />
              <span className="relative z-10 whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle Section */}
      <div className="border-t border-borderShadcn/50 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            {theme === 'light' ? (
              <Sun className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
              <span className="text-xs text-muted-foreground">
                {theme === 'light' ? 'Switch to dark' : 'Switch to light'}
              </span>
            </div>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => {
              if (checked !== (theme === 'dark')) {
                toggleTheme()
              }
            }}
            aria-label="Toggle theme"
            className="hover:opacity-80 transition-opacity"
          />
        </div>
      </div>

      {/* Logout Section */}
      <div className="border-t border-borderShadcn/50 p-3 sm:p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2 sm:gap-3 justify-center py-2 sm:py-3 text-sm sm:text-base font-semibold hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  // Mobile: Show hamburger button and drawer
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50 bg-background shadow-lg"
          onClick={onToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onToggle}
            />
            <div className="fixed left-0 top-0 h-full w-72 animate-in slide-in-from-left">
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop: Always show sidebar
  return (
    <aside className={cn("hidden w-72 transition-all lg:block")}>
      {sidebarContent}
    </aside>
  );
}
