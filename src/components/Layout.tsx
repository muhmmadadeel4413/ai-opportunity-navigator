import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  Sparkles,
  Bookmark,
  LogOut,
  Menu,
  X,
  Search,
  Briefcase,
  UserCircle2,
  LineChart,
  FileText,
  Map,
  Bell,
  ChevronDown,
  Bot,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "AI Smart Search", path: "/ai-smart-search", icon: Search },
    { label: "AI Career Coach", path: "/ai-career-coach", icon: Bot },
    { label: "Application Tracker", path: "/application-tracker", icon: Briefcase },
    { label: "AI Recommendations", path: "/ai-recommendations", icon: LineChart },
    { label: "Resume Analysis", path: "/resume-analysis", icon: FileText },
    { label: "Career Roadmap", path: "/career-roadmap", icon: Map },
    { label: "Saved Opportunities", path: "/saved", icon: Bookmark },
    { label: "Deadline Reminders", path: "/deadline-reminders", icon: Bell },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:bg-white md:border-r md:border-border">
        <div className="flex flex-col h-full p-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 mb-8 group"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-semibold text-lg text-foreground">
              OppNav
            </span>
          </Link>

          <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border pt-4 mt-2">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-accent font-heading font-semibold text-sm">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ||
                    profile?.email?.charAt(0)?.toUpperCase() ||
                    "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || profile?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground/60 hover:text-destructive rounded-lg hover:bg-muted transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-semibold text-foreground">
            OppNav
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Profile button on mobile */}
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer"
            aria-label="Profile"
          >
            <span className="text-accent font-heading font-semibold text-xs">
              {profile?.full_name?.charAt(0)?.toUpperCase() ||
                profile?.email?.charAt(0)?.toUpperCase() ||
                "?"}
            </span>
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-6 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="self-end p-2 rounded-lg hover:bg-muted cursor-pointer mb-4"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-primary text-on-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-muted rounded-lg mt-4 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Top bar with profile button (desktop) */}
      <div className="hidden md:flex md:pl-64">
        <div className="flex items-center justify-end w-full px-8 py-3 bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-accent font-heading font-semibold text-xs">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ||
                    profile?.email?.charAt(0)?.toUpperCase() ||
                    "?"}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground hidden lg:inline">
                {profile?.full_name || profile?.email}
              </span>
              <ChevronDown className="w-4 h-4 text-foreground/40" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-lg py-2 z-50">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <UserCircle2 className="w-4 h-4" />
                  View Profile
                </Link>
                <hr className="border-border my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="md:pl-64 pt-0 md:pt-0">{children}</main>
    </div>
  );
}