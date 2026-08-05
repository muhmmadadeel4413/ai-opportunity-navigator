import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import {
  LayoutDashboard,
  Sparkles,
  Bookmark,
  LogOut,
  Menu,
  X,
  Briefcase,
  UserCircle2,
  ChevronDown,
  GraduationCap,
  Zap,
  Award,
  Target,
  Sun,
  Moon,
  CalendarDays,
  Settings,
  Mail,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Internship Finder", path: "/internship-finder", icon: Briefcase },
    { label: "Scholarship Finder", path: "/scholarship-finder", icon: GraduationCap },
    { label: "Hackathon Finder", path: "/hackathon-finder", icon: Zap },
    { label: "Fellowship Programs", path: "/fellowship-finder", icon: Award },
    { label: "Job Opportunity", path: "/job-finder", icon: Target },
    { label: "Application Tracker", path: "/application-tracker", icon: Briefcase },
    { label: "Deadline Reminders", path: "/deadline-reminders", icon: Bell },
    { label: "Study Planner", path: "/study-planner", icon: CalendarDays },
    { label: "Saved Opportunities", path: "/saved", icon: Bookmark },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderNavLink = (item: { label: string; path: string; icon: typeof LayoutDashboard }, onClick?: () => void) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClick}
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
  };

  const settingsPanel = (
    <>
      {/* Email */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">
            Account
          </p>
          <p className="text-sm text-foreground truncate">
            {profile?.email || "Not signed in"}
          </p>
        </div>
      </div>
      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-accent" />
          ) : (
            <Moon className="w-4 h-4 text-accent" />
          )}
        </div>
        <span className="flex-1 text-left">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
        <div
          className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${
            theme === "dark" ? "bg-primary" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
              theme === "dark" ? "left-[18px]" : "left-0.5"
            }`}
          />
        </div>
      </button>
      {/* View profile */}
      <Link
        to="/profile"
        onClick={() => {
          setSettingsOpen(false);
          setProfileOpen(false);
        }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
          <UserCircle2 className="w-4 h-4 text-secondary" />
        </div>
        View Profile
      </Link>
      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 rounded-xl transition-all duration-200 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
          <LogOut className="w-4 h-4 text-destructive" />
        </div>
        Sign Out
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:bg-surface md:border-r md:border-border">
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
            {navItems.map((item) => renderNavLink(item))}
          </nav>

          {/* Bottom: Settings */}
          <div className="border-t border-border pt-4 mt-2" ref={settingsRef}>
            {/* Profile row */}
            <Link
              to="/profile"
              className="flex items-center gap-3 px-2 mb-2 hover:bg-muted rounded-xl py-1.5 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-accent font-heading font-semibold text-sm">
                    {profile?.full_name?.charAt(0)?.toUpperCase() ||
                      profile?.email?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || "My Account"}
                </p>
                <p className="text-xs text-foreground/50 truncate">{profile?.email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/30" />
            </Link>

            {/* Settings toggle */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                settingsOpen
                  ? "bg-muted text-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
              aria-expanded={settingsOpen}
            >
              <Settings
                className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                  settingsOpen ? "rotate-90" : ""
                }`}
              />
              Settings
              <ChevronDown
                className={`w-4 h-4 ml-auto text-foreground/40 transition-transform duration-200 ${
                  settingsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {settingsOpen && (
              <div className="mt-1 flex flex-col gap-0.5 animate-[fadeIn_0.2s_ease-out]">
                {settingsPanel}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-semibold text-foreground">
            OppNav
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
          {/* Profile button on mobile */}
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer overflow-hidden"
            aria-label="Profile"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-accent font-heading font-semibold text-xs">
                {profile?.full_name?.charAt(0)?.toUpperCase() ||
                  profile?.email?.charAt(0)?.toUpperCase() ||
                  "?"}
              </span>
            )}
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
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-surface shadow-xl p-6 flex flex-col overflow-y-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="self-end p-2 rounded-lg hover:bg-muted cursor-pointer mb-4"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
              {navItems.map((item) =>
                renderNavLink(item, () => setMobileOpen(false))
              )}
            </nav>
            <div className="border-t border-border pt-4 mt-2">
              <div className="flex flex-col gap-0.5">{settingsPanel}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top bar with profile button (desktop) */}
      <div className="hidden md:flex md:pl-64">
        <div className="flex items-center justify-end w-full px-8 py-3 bg-surface/80 backdrop-blur-sm border-b border-border">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-accent font-heading font-semibold text-xs">
                    {profile?.full_name?.charAt(0)?.toUpperCase() ||
                      profile?.email?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-foreground hidden lg:inline">
                {profile?.full_name || profile?.email}
              </span>
              <ChevronDown className="w-4 h-4 text-foreground/40" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg py-2 z-50">
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
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4" />
                      Light mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      Dark mode
                    </>
                  )}
                </button>
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