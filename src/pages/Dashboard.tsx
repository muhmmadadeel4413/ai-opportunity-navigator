import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  ArrowRight,
  User,
  MapPin,
  GraduationCap,
  Search,
  Bookmark,
  Briefcase,
  Bell,
  FileText,
  Bot,
  LineChart,
  Map,
  Target,
  Zap,
  ChevronRight,
  Layers,
} from "lucide-react";

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); o.unobserve(el); } },
      { threshold }
    );
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimatedSection({ children, className = "", threshold }: { children: React.ReactNode; className?: string; threshold?: number }) {
  const { ref, visible } = useScrollReveal(threshold);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}>
      {children}
    </div>
  );
}

export function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState(0);
  const [stars, setStars] = useState<{ x: number; y: number; s: number }[]>([]);

  useEffect(() => {
    setStars(Array.from({ length: 20 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100, s: Math.random() * 2 + 1,
    })));
  }, []);

  useEffect(() => {
    if (!profile) return;

    supabase
      .from("saved_opportunities")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .then(({ count }) => setSavedCount(count || 0));

    supabase
      .from("saved_opportunities")
      .select("opportunity:opportunities(application_deadline)")
      .eq("user_id", profile.id)
      .not("opportunity.application_deadline", "is", null)
      .then(({ data }) => {
        if (data) {
          const now = new Date();
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          const nearDeadline = data.filter((s: any) => {
            const d = s.opportunity?.application_deadline;
            if (!d) return false;
            const deadline = new Date(d);
            return deadline >= now && deadline <= weekFromNow;
          });
          setUpcomingDeadlines(nearDeadline.length);
        }
      });
  }, [profile]);

  const handleFindMatches = async () => {
    setMatching(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const resp = await fetch(
        "https://bficpbbezccjpdifzxek.supabase.co/functions/v1/match-opportunities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ top_k: 10 }),
        }
      );
      const result = await resp.json();
      if (result.error) {
        setError(result.error);
        setMatching(false);
        return;
      }
      sessionStorage.setItem(
        "latest_matches",
        JSON.stringify(result.data || [])
      );
      navigate("/matches");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setMatching(false);
  };

  const quickActions = [
    {
      label: "AI Smart Search",
      desc: "Search opportunities with AI",
      icon: Search,
      path: "/ai-smart-search",
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
    },
    {
      label: "AI Career Coach",
      desc: "Get career advice from AI",
      icon: Bot,
      path: "/ai-career-coach",
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
    },
    {
      label: "Application Tracker",
      desc: "Track your applications",
      icon: Briefcase,
      path: "/application-tracker",
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
    },
    {
      label: "Resume Analysis",
      desc: "Improve your resume",
      icon: FileText,
      path: "/resume-analysis",
      color: "from-emerald-500 to-teal-500",
      bg: "bg-green-50",
    },
  ];

  const exploreItems = [
    {
      label: "Career Roadmap",
      desc: "Visualize your career path with AI-generated roadmaps",
      icon: Map,
      path: "/career-roadmap",
      color: "from-rose-500 to-red-500",
      bg: "bg-rose-50",
    },
    {
      label: "AI Recommendations",
      desc: "Get personalized recommendations based on your profile",
      icon: LineChart,
      path: "/ai-recommendations",
      color: "from-indigo-500 to-violet-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Saved Opportunities",
      desc: "Review and manage your saved opportunities",
      icon: Bookmark,
      path: "/saved",
      color: "from-teal-500 to-emerald-500",
      bg: "bg-teal-50",
    },
    {
      label: "Deadline Reminders",
      desc: "Never miss a deadline with smart alerts",
      icon: Bell,
      path: "/deadline-reminders",
      color: "from-amber-500 to-yellow-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden relative">
      {/* Floating particles */}
      {stars.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {stars.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-primary/20 animate-pulse"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`,
                animationDelay: `${i * 0.3}s`, animationDuration: `${2 + s.s * 1.5}s` }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto">
        {/* ─── HERO SECTION ─── */}
        <section className="relative mb-12 md:mb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none rounded-3xl" />
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          
          <AnimatedSection>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" /> Dashboard
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
                <span className="block mt-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Ready to find your next opportunity?
                </span>
              </h1>
              <p className="mt-4 text-lg text-foreground/60 max-w-2xl">
                Your AI-powered career navigator. Discover, track, and land the opportunities that fit you best.
              </p>
            </div>
          </AnimatedSection>
        </section>

        {/* ─── STATS ROW ─── */}
        <AnimatedSection threshold={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            <button
              onClick={() => navigate("/saved")}
              className="group relative bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Bookmark className="w-6 h-6 text-accent" />
                </div>
                <ArrowRight className="w-5 h-5 text-foreground/20 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <p className="text-4xl font-heading font-bold text-foreground mb-1">
                {savedCount}
              </p>
              <p className="text-sm text-foreground/60">Saved Opportunities</p>
            </button>

            <button
              onClick={() => navigate("/deadline-reminders")}
              className="group relative bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:border-amber-300/30 transition-all duration-300 cursor-pointer text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Bell className="w-6 h-6 text-amber-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-foreground/20 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <p className="text-4xl font-heading font-bold text-foreground mb-1">
                {upcomingDeadlines}
              </p>
              <p className="text-sm text-foreground/60">Upcoming Deadlines</p>
            </button>
          </div>
        </AnimatedSection>

        {/* ─── PROFILE SNAPSHOT ─── */}
        {profile && (
          <AnimatedSection threshold={0.1}>
            <div className="bg-white border border-border rounded-2xl p-6 md:p-8 mb-10 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-xl text-foreground">
                  Your Profile Snapshot
                </h2>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                >
                  Edit Profile →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group p-4 bg-gradient-to-br from-primary/5 to-primary/[0.02] rounded-xl border border-primary/10 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <GraduationCap className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-foreground/50 mb-1">Education</p>
                  <p className="text-sm font-semibold text-foreground">
                    {profile.education_level || "Not set"}
                  </p>
                </div>
                <div className="relative group p-4 bg-gradient-to-br from-secondary/5 to-secondary/[0.02] rounded-xl border border-secondary/10 hover:shadow-md hover:border-secondary/20 transition-all duration-300">
                  <User className="w-5 h-5 text-secondary mb-2" />
                  <p className="text-xs text-foreground/50 mb-1">Major / University</p>
                  <p className="text-sm font-semibold text-foreground">
                    {profile.major || profile.university || "Not set"}
                  </p>
                </div>
                <div className="relative group p-4 bg-gradient-to-br from-accent/5 to-accent/[0.02] rounded-xl border border-accent/10 hover:shadow-md hover:border-accent/20 transition-all duration-300">
                  <MapPin className="w-5 h-5 text-accent mb-2" />
                  <p className="text-xs text-foreground/50 mb-1">Location Preference</p>
                  <p className="text-sm font-semibold text-foreground">
                    {profile.location_preference || "Anywhere"}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* ─── FIND MATCHES CTA ─── */}
        <AnimatedSection threshold={0.1}>
          <div className="relative bg-gradient-to-br from-accent/5 via-white to-white border border-border rounded-2xl p-8 md:p-12 shadow-sm mb-10 overflow-hidden">
            <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3">
                Find Your Perfect Match
              </h2>
              <p className="text-foreground/60 mb-8 max-w-lg mx-auto">
                Our AI analyzes your profile against hundreds of opportunities —
                internships, scholarships, hackathons, and more. Get personalized
                matches with explanations of why each one fits you.
              </p>

              {error && (
                <div className="mb-4 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                onClick={handleFindMatches}
                disabled={matching}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-amber-500 text-white font-semibold text-lg rounded-2xl hover:shadow-xl hover:shadow-accent/25 active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-lg shadow-accent/20 disabled:opacity-50"
              >
                {matching ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Finding matches...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Find My Matches
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </AnimatedSection>

        {/* ─── QUICK ACTIONS ─── */}
        <AnimatedSection threshold={0.1}>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-accent" />
              <h2 className="font-heading font-semibold text-xl text-foreground">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="group bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
                  >
                    <div className={`w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" style={{ color: action.color.includes('blue') ? '#3b82f6' : action.color.includes('purple') ? '#a855f7' : action.color.includes('amber') ? '#d97706' : '#10b981' }} />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-foreground/60">{action.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* ─── EXPLORE MORE ─── */}
        <AnimatedSection threshold={0.1}>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-xl text-foreground">
                Explore More
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {exploreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-left"
                  >
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" style={{ color: item.color.includes('rose') ? '#e11d48' : item.color.includes('indigo') ? '#6366f1' : item.color.includes('teal') ? '#14b8a6' : '#d97706' }} />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-sm text-foreground/60">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* ─── BOTTOM CTA ─── */}
        <AnimatedSection threshold={0.1}>
          <div className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl border border-border p-8 md:p-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/30 pointer-events-none" />
            <div className="relative">
              <Target className="w-10 h-10 text-primary/30 mx-auto mb-4" />
              <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
                Ready to Take the Next Step?
              </h2>
              <p className="text-foreground/60 max-w-xl mx-auto mb-6">
                Keep your profile up to date so our AI can find the best opportunities for you.
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97] transition-all duration-150 cursor-pointer"
              >
                <User className="w-4 h-4" />
                Edit Your Profile
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}