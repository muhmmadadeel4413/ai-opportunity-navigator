import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Zap,
  Award,
  Target,
  Bot,
  Search,
  Sparkles,
  FileText,
  Map,
  ClipboardList,
  Bell,
  CalendarDays,
  Bookmark,
  LogOut,
  Menu,
  X,
  UserCircle2,
  ChevronDown,
  Sun,
  Moon,
  Compass,
} from "lucide-react";

type NavItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
};

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Discover",
    items: [
      { label: "Internships", path: "/internship-finder", icon: Briefcase },
      { label: "Scholarships", path: "/scholarship-finder", icon: GraduationCap },
      { label: "Hackathons", path: "/hackathon-finder", icon: Zap },
      { label: "Fellowships", path: "/fellowship-finder", icon: Award },
      { label: "Jobs", path: "/job-finder", icon: Target },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { label: "Career Coach", path: "/ai-career-coach", icon: Bot },
      { label: "Smart Search", path: "/ai-smart-search", icon: Search },
      { label: "Recommendations", path: "/ai-recommendations", icon: Sparkles },
      { label: "Resume Analysis", path: "/resume-analysis", icon: FileText },
      { label: "Career Roadmap", path: "/career-roadmap", icon: Map },
    ],
  },
  {
    label: "Track",
    items: [
      { label: "Applications", path: "/application-tracker", icon: ClipboardList },
      { label: "Deadlines", path: "/deadline-reminders", icon: Bell },
      { label: "Study Planner", path: "/study-planner", icon: CalendarDays },
      { label: "Saved", path: "/saved", icon: Bookmark },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

const PAGE_TITLES: Record<string, string> = {
  "/profile": "Profile",
  "/matches": "Matches",
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const avatarInitial = (
    profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "?"
  ).toUpperCase();

  const currentPage =
    ALL_NAV_ITEMS.find((i) => i.path === location.pathname)?.label ||
    PAGE_TITLES[location.pathname] ||
    "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const renderAvatar = (size: "sm" | "md" = "md") => {
    const cls = size === "sm" ? "w-7 h-7" : "w-8 h-8";
    return (
      <div
        className={`${cls} rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0`}
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-[11px] font-semibold text-foreground">
            {avatarInitial}
          </span>
        )}
      </div>
    );
  };

  const renderNavLink = (item: NavItem, onClick?: () => void) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
          active
            ? "bg-muted text-foreground font-medium"
            : "text-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Icon
          className={`h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${
            active
              ? "text-primary"
              : "text-foreground-muted group-hover:text-foreground"
          }`}
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="truncate">{item.label}</span>
        {active && (
          <span
            className="absolute left-0 top-1/2 h-[14px] w-[3px] -translate-y-1/2 rounded-full bg-primary"
            aria-hidden="true"
          />
        )}
      </Link>
    );
  };

  const settingsMenu = (
    <>
      <div className="px-3.5 py-2.5 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground-muted">
          Signed in as
        </p>
        <p className="mt-0.5 text-[13px] font-medium text-foreground truncate">
          {profile?.email}
        </p>
      </div>
      <Link
        to="/profile"
        onClick={() => {
          setSettingsOpen(false);
          setMobileOpen(false);
        }}
        role="menuitem"
        className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
      >
        <UserCircle2 className="w-4 h-4 text-foreground-muted" aria-hidden="true" />
        View Profile
      </Link>
      <button
        onClick={toggleTheme}
        role="menuitem"
        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
      >
        {theme === "dark" ? (
          <>
            <Sun className="w-4 h-4 text-foreground-muted" aria-hidden="true" />
            Light mode
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-foreground-muted" aria-hidden="true" />
            Dark mode
          </>
        )}
      </button>
      <hr className="border-border mx-2 my-1" role="separator" />
      <button
        onClick={handleSignOut}
        role="menuitem"
        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] font-medium text-destructive hover:bg-destructive/5 transition-colors duration-150 cursor-pointer"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        Sign out
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ===== Desktop Sidebar ===== */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:w-[248px] md:flex-col bg-surface border-r border-border z-40">
        <div className="flex h-full flex-col">
          {/* Brand */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 h-14 px-5 shrink-0 group"
          >
            <div className="w-7 h-7 rounded-[7px] bg-foreground text-background flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Compass className="w-[15px] h-[15px]" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              OppNav
            </span>
          </Link>

          {/* Navigation */}
          <nav
            className="flex-1 overflow-y-auto px-3 pb-4 pt-3 space-y-5 [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent]"
            aria-label="Main navigation"
          >
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground-muted">
                  {section.label}
                </p>
                <div className="flex flex-col gap-px">
                  {section.items.map((item) => renderNavLink(item))}
                </div>
              </div>
            ))}
          </nav>

          {/* User chip */}
          <div className="border-t border-border p-3" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
              className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors duration-150 cursor-pointer hover:bg-muted"
            >
              {renderAvatar()}
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {profile?.full_name || profile?.email || "My Account"}
                </p>
                {profile?.full_name && (
                  <p className="truncate text-[11px] text-foreground-muted">
                    {profile?.email}
                  </p>
                )}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-foreground-muted transition-transform duration-200 ${
                  settingsOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {/* Settings popover (opens upward) */}
            {settingsOpen && (
              <div
                role="menu"
                className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-border bg-surface shadow-xl shadow-zinc-900/10 py-1.5 z-50 overflow-hidden animate-[fadeIn_0.12s_ease-out]"
              >
                {settingsMenu}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ===== Desktop content area ===== */}
      <div className="md:pl-[248px]">
        {/* Top bar */}
        <header className="hidden md:flex items-center justify-between h-14 px-8 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30">
          <span className="text-sm font-medium text-foreground">
            {currentPage}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-[18px] h-[18px]" aria-hidden="true" />
              ) : (
                <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
              )}
            </button>
            <Link
              to="/profile"
              className="rounded-lg hover:bg-muted transition-colors duration-150 cursor-pointer p-0.5"
              aria-label="Profile"
            >
              {renderAvatar("sm")}
            </Link>
          </div>
        </header>

        {/* ===== Mobile header ===== */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 bg-surface border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[7px] bg-foreground text-background flex items-center justify-center">
              <Compass className="w-[15px] h-[15px]" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              OppNav
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-[18px] h-[18px]" aria-hidden="true" />
              ) : (
                <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
              )}
            </button>
            <Link
              to="/profile"
              className="rounded-lg hover:bg-muted transition-colors duration-150 cursor-pointer p-0.5"
              aria-label="Profile"
            >
              {renderAvatar("sm")}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-[18px] h-[18px]" aria-hidden="true" />
              ) : (
                <Menu className="w-[18px] h-[18px]" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* ===== Main content ===== */}
        <main className="flex-1 min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>

      {/* ===== Mobile drawer overlay ===== */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-surface shadow-xl flex flex-col overflow-y-auto animate-[slideIn_0.2s_ease-out]">
            <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-[18px] h-[18px]" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Mobile navigation">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground-muted">
                    {section.label}
                  </p>
                  <div className="flex flex-col gap-px">
                    {section.items.map((item) =>
                      renderNavLink(item, () => setMobileOpen(false))
                    )}
                  </div>
                </div>
              ))}
            </nav>

            {/* Mobile bottom actions */}
            <div className="border-t border-border p-3 space-y-px">
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
              >
                <UserCircle2 className="w-[18px] h-[18px] text-foreground-muted" aria-hidden="true" />
                View Profile
              </Link>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors duration-150 cursor-pointer"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-[18px] h-[18px] text-foreground-muted" aria-hidden="true" />
                    Light mode
                  </>
                ) : (
                  <>
                    <Moon className="w-[18px] h-[18px] text-foreground-muted" aria-hidden="true" />
                    Dark mode
                  </>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-[13px] font-medium text-destructive hover:bg-destructive/5 transition-colors duration-150 cursor-pointer"
              >
                <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}