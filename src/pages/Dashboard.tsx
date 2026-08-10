import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { callAI } from "../lib/ai";
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
  Building2,
  Clock,
  ExternalLink,
  RefreshCw,
  CalendarClock,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Scroll Reveal
───────────────────────────────────────────── */

function useScrollReveal(threshold = 0.15) {
  const ref = useMemo(
    () => ({ current: null as HTMLDivElement | null }),
    []
  );

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref, visible };
}

function AnimatedSection({
  children,
  className = "",
  threshold,
}: {
  children: ReactNode;
  className?: string;
  threshold?: number;
}) {
  const { ref, visible } = useScrollReveal(threshold);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

interface Match {
  opportunity: {
    id: string;
    title: string;
    description: string;
    opportunity_type: string;
    organization: string;
    location: string | null;
    is_remote: boolean;
    url: string | null;
    application_deadline: string | null;
    compensation: string | null;
    duration: string | null;
    required_skills: string[];
    preferred_skills: string[];
    education_requirements: string | null;
    tags: string[];
  };
  match_score: number;
  ai_explanation: string;
}

interface DeadlineItem {
  id: string;
  status: string;
  opportunity: {
    title: string;
    organization: string;
    application_deadline: string | null;
    url: string | null;
  } | null;
}

/* ─────────────────────────────────────────────
   Dashboard
───────────────────────────────────────────── */

export function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  const [savedCount, setSavedCount] = useState(0);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState(0);

  const [recommendation, setRecommendation] =
    useState<Match | null>(null);

  const [recommendationLoading, setRecommendationLoading] =
    useState(true);

  const [savedIds, setSavedIds] = useState<Set<string>>(
    new Set()
  );

  const [savingRecommendation, setSavingRecommendation] =
    useState(false);

  const [roadmapPreview, setRoadmapPreview] = useState("");
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const [deadlineItems, setDeadlineItems] = useState<
    DeadlineItem[]
  >([]);

  const [stars, setStars] = useState<
    { x: number; y: number; s: number }[]
  >([]);

  /* ─────────────────────────────────────────────
     Floating stars
  ───────────────────────────────────────────── */

  useEffect(() => {
    setStars(
      Array.from({ length: 20 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 2 + 1,
      }))
    );
  }, []);

  /* ─────────────────────────────────────────────
     Load dashboard data
  ───────────────────────────────────────────── */

  useEffect(() => {
    if (!profile) return;

    // Saved count
    supabase
      .from("saved_opportunities")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", profile.id)
      .then(({ count }) => {
        setSavedCount(count || 0);
      });

    // Saved IDs
    supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .eq("user_id", profile.id)
      .then(({ data }) => {
        if (data) {
          setSavedIds(
            new Set(
              data.map(
                (item) => item.opportunity_id as string
              )
            )
          );
        }
      });

    // Upcoming deadlines
    supabase
      .from("saved_opportunities")
      .select(
        `
          id,
          status,
          opportunity:opportunities(
            title,
            organization,
            application_deadline,
            url
          )
        `
      )
      .eq("user_id", profile.id)
      .not(
        "opportunity.application_deadline",
        "is",
        null
      )
      .then(({ data }) => {
        if (!data) return;

        const now = new Date();

        const weekFromNow = new Date(
          now.getTime() +
            7 * 24 * 60 * 60 * 1000
        );

        const filtered = (
          data as unknown as DeadlineItem[]
        ).filter((item) => {
          const deadline =
            item.opportunity?.application_deadline;

          if (!deadline) return false;

          const date = new Date(deadline);

          return date >= now && date <= weekFromNow;
        });

        setUpcomingDeadlines(filtered.length);

        setDeadlineItems(
          filtered
            .sort((a, b) => {
              const aDate = new Date(
                a.opportunity?.application_deadline || ""
              ).getTime();

              const bDate = new Date(
                b.opportunity?.application_deadline || ""
              ).getTime();

              return aDate - bDate;
            })
            .slice(0, 3)
        );
      });
  }, [profile]);

  /* ─────────────────────────────────────────────
     Today's Top Recommendation
     Highest match_score from all matched opportunities
  ───────────────────────────────────────────── */

  const loadRecommendation = async () => {
    if (!user) return;

    setRecommendationLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setRecommendationLoading(false);
        return;
      }

      const response = await fetch(
        "https://bficpbbezccjpdifzxek.supabase.co/functions/v1/match-opportunities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            top_k: 10,
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        console.error(
          "Recommendation error:",
          result.error
        );

        setRecommendation(null);
        setRecommendationLoading(false);
        return;
      }

      const matches: Match[] = result.data || [];

      if (matches.length === 0) {
        setRecommendation(null);
        setRecommendationLoading(false);
        return;
      }

      const bestMatch = [...matches].sort(
        (a, b) => b.match_score - a.match_score
      )[0];

      setRecommendation(bestMatch);
    } catch (err) {
      console.error(
        "Failed to load recommendation:",
        err
      );

      setRecommendation(null);
    }

    setRecommendationLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    loadRecommendation();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ─────────────────────────────────────────────
     Career Roadmap preview
  ───────────────────────────────────────────── */

  const loadRoadmapPreview = async () => {
    if (!user) return;

    setRoadmapLoading(true);

    try {
      const result = await callAI({
        mode: "career_roadmap",
      });

      setRoadmapPreview(result.content);
    } catch (err) {
      console.error(
        "Failed to generate roadmap:",
        err
      );
    }

    setRoadmapLoading(false);
  };

  /* ─────────────────────────────────────────────
     Find Matches
  ───────────────────────────────────────────── */

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
          body: JSON.stringify({
            top_k: 10,
          }),
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
      setError(
        "Something went wrong. Please try again."
      );
    }

    setMatching(false);
  };

  /* ─────────────────────────────────────────────
     Save recommendation
  ───────────────────────────────────────────── */

  const handleSaveRecommendation = async () => {
    if (!recommendation || !user) return;

    const opportunityId =
      recommendation.opportunity.id;

    setSavingRecommendation(true);

    try {
      if (savedIds.has(opportunityId)) {
        await supabase
          .from("saved_opportunities")
          .delete()
          .eq("user_id", user.id)
          .eq(
            "opportunity_id",
            opportunityId
          );

        setSavedIds((previous) => {
          const next = new Set(previous);
          next.delete(opportunityId);
          return next;
        });

        setSavedCount((count) =>
          Math.max(0, count - 1)
        );
      } else {
        await supabase
          .from("saved_opportunities")
          .insert({
            user_id: user.id,
            opportunity_id: opportunityId,
            match_score:
              recommendation.match_score,
            ai_explanation:
              recommendation.ai_explanation,
            status: "saved",
          });

        setSavedIds((previous) => {
          const next = new Set(previous);
          next.add(opportunityId);
          return next;
        });

        setSavedCount((count) => count + 1);
      }
    } catch (err) {
      console.error(
        "Failed to save recommendation:",
        err
      );
    }

    setSavingRecommendation(false);
  };

  /* ─────────────────────────────────────────────
     Deadline formatting
  ───────────────────────────────────────────── */

  const formatDeadline = (
    date: string | null
  ) => {
    if (!date) return "";

    const deadline = new Date(date);
    const now = new Date();

    const diffDays = Math.ceil(
      (deadline.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0)
      return "Deadline passed";

    if (diffDays === 0)
      return "Due today";

    if (diffDays === 1)
      return "Due tomorrow";

    if (diffDays <= 7)
      return `${diffDays} days left`;

    return deadline.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  /* ─────────────────────────────────────────────
     Quick Actions
  ───────────────────────────────────────────── */

  const quickActions = [
    {
      label: "AI Smart Search",
      desc: "Search opportunities with AI",
      icon: Search,
      path: "/ai-smart-search",
      bg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "AI Career Coach",
      desc: "Get career advice from AI",
      icon: Bot,
      path: "/ai-career-coach",
      bg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      label: "Application Tracker",
      desc: "Track your applications",
      icon: Briefcase,
      path: "/application-tracker",
      bg: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      label: "Resume Analysis",
      desc: "Improve your resume",
      icon: FileText,
      path: "/resume-analysis",
      bg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  /* ─────────────────────────────────────────────
     Explore
  ───────────────────────────────────────────── */

  const exploreItems = [
    {
      label: "Career Roadmap",
      desc: "Visualize your career path with AI-generated roadmaps",
      icon: Map,
      path: "/career-roadmap",
      bg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
    {
      label: "AI Recommendations",
      desc: "Get personalized recommendations based on your profile",
      icon: LineChart,
      path: "/ai-recommendations",
      bg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Saved Opportunities",
      desc: "Review and manage your saved opportunities",
      icon: Bookmark,
      path: "/saved",
      bg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      label: "Deadline Reminders",
      desc: "Never miss a deadline with smart alerts",
      icon: Bell,
      path: "/deadline-reminders",
      bg: "bg-accent/10",
      iconColor: "text-accent",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Floating particles */}
      {stars.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {stars.map((star, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-primary/20 animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.s}px`,
                height: `${star.s}px`,
                animationDelay: `${index * 0.3}s`,
                animationDuration: `${
                  2 + star.s * 1.5
                }s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-5 md:p-8 max-w-6xl mx-auto">

        {/* HERO */}
        <section className="relative mb-10 md:mb-12">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none rounded-3xl" />

          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <AnimatedSection>
            <div className="relative">

              {/* BRAND / PAGE LABEL */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Opportunity Navigator
              </div>
              {/* SMALLER WELCOME HEADING */}
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back <span className="animate-wave inline-block">👋</span>
              </h1>
               <p className="text-gray-500 dark:text-gray-400 mt-1">Here is your opportunity snapshot for today</p>
            </div>
          </AnimatedSection>
        </section>

        {/* TODAY'S TOP RECOMMENDATION */}
        <AnimatedSection threshold={0.1}>
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-accent" />

                  <h2 className="font-heading font-semibold text-xl text-foreground">
                    Today's Top Recommendation
                  </h2>
                </div>

                <p className="text-sm text-foreground/50">
                  Highest AI match from your matched opportunities
                </p>
              </div>

              <button
                onClick={loadRecommendation}
                disabled={recommendationLoading}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    recommendationLoading
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh
              </button>
            </div>

            {recommendationLoading ? (
              <div className="bg-white border border-border rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                </div>

                <p className="text-foreground/60">
                  Finding your best opportunity...
                </p>
              </div>
            ) : recommendation ? (
              <RecommendationCard
                match={recommendation}
                isSaved={savedIds.has(
                  recommendation.opportunity.id
                )}
                saving={savingRecommendation}
                onSave={handleSaveRecommendation}
                onApply={() => {
                  if (recommendation.opportunity.url) {
                    window.open(
                      recommendation.opportunity.url,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }
                }}
                formatDeadline={formatDeadline}
              />
            ) : (
              <div className="bg-white border border-border rounded-2xl p-10 text-center">
                <Sparkles className="w-10 h-10 text-foreground/20 mx-auto mb-3" />

                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  No recommendation yet
                </h3>

                <p className="text-sm text-foreground/60 max-w-md mx-auto mb-5">
                  Find your matches first and we'll automatically select your highest-scoring opportunity.
                </p>

                <button
                  onClick={handleFindMatches}
                  disabled={matching}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-accent to-amber-500 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />

                  {matching
                    ? "Finding matches..."
                    : "Find My Matches"}
                </button>
              </div>
            )}
          </section>
        </AnimatedSection>

        {/* STATS */}
        <AnimatedSection threshold={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">

            <button
              onClick={() => navigate("/saved")}
              className="group relative bg-surface rounded-2xl border border-border p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer text-left overflow-hidden"
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

              <p className="text-sm text-foreground/60">
                Saved Opportunities
              </p>
            </button>

            <button
              onClick={() =>
                navigate("/deadline-reminders")
              }
              className="group relative bg-surface rounded-2xl border border-border p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-500" />

              <div className="relative flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Bell className="w-6 h-6 text-accent" />
                </div>

                <ArrowRight className="w-5 h-5 text-foreground/20 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
              </div>

              <p className="text-4xl font-heading font-bold text-foreground mb-1">
                {upcomingDeadlines}
              </p>

              <p className="text-sm text-foreground/60">
                Upcoming Deadlines
              </p>
            </button>
          </div>
        </AnimatedSection>

        {/* PROFILE SNAPSHOT */}
        {profile && (
          <AnimatedSection threshold={0.1}>
            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-10 shadow-sm hover:shadow-md transition-all duration-300">

              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-xl text-foreground">
                  Your Profile Snapshot
                </h2>

                <button
                  onClick={() =>
                    navigate("/onboarding")
                  }
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                >
                  Edit Profile →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="relative group p-4 bg-gradient-to-br from-primary/5 to-primary/[0.02] rounded-xl border border-primary/10 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <GraduationCap className="w-5 h-5 text-primary mb-2" />

                  <p className="text-xs text-foreground/50 mb-1">
                    Education
                  </p>

                  <p className="text-sm font-semibold text-foreground">
                    {profile.education_level ||
                      "Not set"}
                  </p>
                </div>

                <div className="relative group p-4 bg-gradient-to-br from-secondary/5 to-secondary/[0.02] rounded-xl border border-secondary/10 hover:shadow-md hover:border-secondary/20 transition-all duration-300">
                  <User className="w-5 h-5 text-secondary mb-2" />

                  <p className="text-xs text-foreground/50 mb-1">
                    Major / University
                  </p>

                  <p className="text-sm font-semibold text-foreground">
                    {profile.major ||
                      profile.university ||
                      "Not set"}
                  </p>
                </div>

                <div className="relative group p-4 bg-gradient-to-br from-accent/5 to-accent/[0.02] rounded-xl border border-accent/10 hover:shadow-md hover:border-accent/20 transition-all duration-300">
                  <MapPin className="w-5 h-5 text-accent mb-2" />

                  <p className="text-xs text-foreground/50 mb-1">
                    Location Preference
                  </p>

                  <p className="text-sm font-semibold text-foreground">
                    {profile.location_preference ||
                      "Anywhere"}
                  </p>
                </div>

              </div>
            </div>
          </AnimatedSection>
        )}

        {/* YOUR ROADMAP */}
        <AnimatedSection threshold={0.1}>
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />

                <h2 className="font-heading font-semibold text-xl text-foreground">
                  Your Roadmap
                </h2>
              </div>

              <button
                onClick={() =>
                  navigate("/career-roadmap")
                }
                className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer"
              >
                View Full Roadmap →
              </button>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">

              {!roadmapPreview &&
              !roadmapLoading ? (
                <div className="text-center py-6">
                  <Map className="w-10 h-10 text-foreground/20 mx-auto mb-3" />

                  <p className="text-sm text-foreground/60 mb-4">
                    Generate your personalized AI career roadmap.
                  </p>

                  <button
                    onClick={loadRoadmapPreview}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Roadmap
                  </button>
                </div>
              ) : roadmapLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />

                  <p className="text-sm text-foreground/60">
                    Building your career roadmap...
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4 text-accent">
                    <Sparkles className="w-5 h-5" />

                    <span className="font-heading font-semibold">
                      AI Career Roadmap
                    </span>
                  </div>

                  <div className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {roadmapPreview}
                  </div>

                  <button
                    onClick={() =>
                      navigate("/career-roadmap")
                    }
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline cursor-pointer"
                  >
                    Explore your complete roadmap
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </section>
        </AnimatedSection>

        {/* UPCOMING DEADLINES */}
        <AnimatedSection threshold={0.1}>
          <section className="mb-10">

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />

                <div>
                  <h2 className="font-heading font-semibold text-xl text-foreground">
                    Upcoming Deadlines
                  </h2>

                  <p className="text-sm text-foreground/50">
                    Your most urgent saved opportunities
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/deadline-reminders")
                }
                className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer"
              >
                View All →
              </button>
            </div>

            {deadlineItems.length > 0 ? (
              <div className="space-y-3">
                {deadlineItems.map((item) => {
                  const opportunity =
                    item.opportunity;

                  if (!opportunity) return null;

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        <div className="min-w-0">
                          <h3 className="font-heading font-semibold text-foreground truncate">
                            {opportunity.title}
                          </h3>

                          <p className="text-sm text-foreground/60 flex items-center gap-1 mt-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {opportunity.organization}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-700">
                            <Clock className="w-4 h-4" />

                            <span className="text-sm font-semibold">
                              {formatDeadline(
                                opportunity.application_deadline
                              )}
                            </span>
                          </div>

                          {opportunity.url && (
                            <a
                              href={opportunity.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl text-primary hover:bg-primary/5 cursor-pointer"
                              aria-label="View opportunity"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-border rounded-2xl p-8 text-center">
                <CalendarClock className="w-10 h-10 text-foreground/20 mx-auto mb-3" />

                <p className="text-sm text-foreground/60 mb-4">
                  You don't have any deadlines within the next 7 days.
                </p>

                <button
                  onClick={() =>
                    navigate("/deadline-reminders")
                  }
                  className="text-sm font-medium text-primary hover:underline cursor-pointer"
                >
                  Check all deadlines
                </button>
              </div>
            )}
          </section>
        </AnimatedSection>

        {/* FIND MATCHES CTA */}
        <AnimatedSection threshold={0.1}>
          <div className="relative bg-gradient-to-br from-accent/5 via-surface to-surface border border-border rounded-2xl p-8 md:p-12 shadow-sm mb-10 overflow-hidden">

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
                Our AI analyzes your profile against hundreds of opportunities — internships, scholarships, hackathons, and more. Get personalized matches with explanations of why each one fits you.
              </p>

              {error && (
                <div className="mb-4 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 border border-destructive/10">
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

        {/* QUICK ACTIONS */}
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
                    onClick={() =>
                      navigate(action.path)
                    }
                    className="group bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
                  >
                    <div
                      className={`w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon
                        className={`w-6 h-6 ${action.iconColor}`}
                      />
                    </div>

                    <h3 className="font-heading font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>

                    <p className="text-sm text-foreground/60">
                      {action.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* EXPLORE MORE */}
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
                    onClick={() =>
                      navigate(item.path)
                    }
                    className="group bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-left"
                  >
                    <div
                      className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon
                        className={`w-6 h-6 ${item.iconColor}`}
                      />
                    </div>

                    <h3 className="font-heading font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {item.label}
                    </h3>

                    <p className="text-sm text-foreground/60">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* BOTTOM CTA */}
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
                onClick={() =>
                  navigate("/onboarding")
                }
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97] transition-all duration-150"
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

/* ─────────────────────────────────────────────
   Recommendation Card
───────────────────────────────────────────── */

function RecommendationCard({
  match,
  isSaved,
  saving,
  onSave,
  onApply,
  formatDeadline,
}: {
  match: Match;
  isSaved: boolean;
  saving: boolean;
  onSave: () => void;
  onApply: () => void;
  formatDeadline: (date: string | null) => string;
}) {
  const o = match.opportunity;

  const scorePct = Math.round(
    match.match_score * 100
  );

  const scoreColor =
    scorePct >= 80
      ? "text-green-600"
      : scorePct >= 60
      ? "text-accent"
      : "text-primary";

  const scoreBg =
    scorePct >= 80
      ? "bg-green-50 border-green-200"
      : scorePct >= 60
      ? "bg-accent/5 border-accent/20"
      : "bg-primary/5 border-primary/20";

  return (
    <div className="relative bg-white border border-border rounded-2xl overflow-hidden shadow-sm">

      {/* Recommendation ribbon */}
      <div className="absolute top-0 right-0">
        <div className="px-4 py-1.5 bg-gradient-to-r from-accent to-amber-500 text-white text-xs font-semibold rounded-bl-xl">
          AI Recommended
        </div>
      </div>

      <div className="p-6 md:p-8">

        <div className="flex flex-col lg:flex-row gap-7">

          {/* Main information */}
          <div className="flex-1 min-w-0 pt-2">

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
                {o.opportunity_type}
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-foreground/50">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Highest match
              </span>
            </div>

            <h3 className="font-heading font-bold text-xl md:text-2xl text-foreground mb-2">
              {o.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60 mb-5">

              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {o.organization}
              </span>

              {o.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {o.location}
                </span>
              )}

              {o.is_remote && (
                <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                  Remote
                </span>
              )}

              {o.application_deadline && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <Clock className="w-4 h-4" />
                  {formatDeadline(
                    o.application_deadline
                  )}
                </span>
              )}

            </div>

            <p className="text-sm text-foreground/70 leading-relaxed mb-5">
              {o.description}
            </p>

            {/* Match reason */}
            <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />

                <div>
                  <p className="text-xs font-semibold text-accent mb-1">
                    Why AI recommends this
                  </p>

                  <p className="text-sm text-foreground/75 leading-relaxed">
                    {match.ai_explanation ||
                      "This opportunity has the strongest match score with your profile."}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {o.required_skills &&
              o.required_skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-2">
                    Required Skills
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {o.required_skills
                      .slice(0, 6)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2.5 py-1 bg-primary/5 text-primary rounded-full"
                        >
                          {skill}
                        </span>
                      ))}

                    {o.required_skills.length > 6 && (
                      <span className="text-xs text-foreground/40 py-1">
                        +
                        {o.required_skills.length - 6}{" "}
                        more
                      </span>
                    )}
                  </div>
                </div>
              )}

          </div>

          {/* Match score */}
          <div className="lg:w-40 shrink-0 flex lg:flex-col items-center justify-center gap-4 lg:border-l lg:border-border lg:pl-7">

            <div
              className={`relative w-28 h-28 rounded-full border-8 ${scoreBg} flex items-center justify-center`}
            >
              <div className="text-center">
                <p
                  className={`font-heading font-bold text-3xl ${scoreColor}`}
                >
                  {scorePct}%
                </p>

                <p className="text-[10px] text-foreground/50 uppercase tracking-wide">
                  Match
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-foreground/50">
                Based on your profile
              </p>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-5 mt-6 border-t border-border">

          {o.url && (
            <button
              onClick={onApply}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              View & Apply
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all cursor-pointer disabled:opacity-50 ${
              isSaved
                ? "bg-accent/10 text-accent hover:bg-accent/15"
                : "text-foreground/60 hover:text-accent hover:bg-accent/5"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${
                isSaved ? "fill-accent" : ""
              }`}
            />

            {isSaved ? "Saved" : "Save"}
          </button>

        </div>
      </div>
    </div>
  );
}