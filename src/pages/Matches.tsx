import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  Sparkles,
  Bookmark,
  MapPin,
  Clock,
  ExternalLink,
  Building2,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

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

export function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError("");

    // Check session storage first
    const cached = sessionStorage.getItem("latest_matches");
    if (cached) {
      setMatches(JSON.parse(cached));
      setLoading(false);
      sessionStorage.removeItem("latest_matches");
      return;
    }

    // Otherwise call the edge function
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
          body: JSON.stringify({ user_id: user!.id, top_k: 10 }),
        }
      );
      const result = await resp.json();
      if (result.error) {
        setError(result.error);
      } else {
        setMatches(result.data || []);
      }
    } catch {
      setError("Failed to load matches. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
    // Load saved opportunity IDs
    supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .eq("user_id", profile!.id)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((s) => s.opportunity_id)));
      });
  }, []);

  const handleSave = async (match: Match) => {
    setSavingId(match.opportunity.id);
    const oppId = match.opportunity.id;
    if (savedIds.has(oppId)) {
      // Unsave
      await supabase
        .from("saved_opportunities")
        .delete()
        .eq("user_id", user!.id)
        .eq("opportunity_id", oppId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(oppId);
        return next;
      });
    } else {
      // Save
      await supabase.from("saved_opportunities").insert({
        user_id: user!.id,
        opportunity_id: oppId,
        match_score: match.match_score,
        ai_explanation: match.ai_explanation,
      });
      setSavedIds((prev) => new Set(prev).add(oppId));
    }
    setSavingId(null);
  };

  const typeBadgeColor = (type: string) => {
    const map: Record<string, string> = {
      internship: "bg-blue-100 text-blue-700",
      scholarship: "bg-green-100 text-green-700",
      hackathon: "bg-purple-100 text-purple-700",
      certification: "bg-amber-100 text-amber-700",
      job: "bg-rose-100 text-rose-700",
      fellowship: "bg-teal-100 text-teal-700",
      volunteer: "bg-orange-100 text-orange-700",
    };
    return map[type] || "bg-gray-100 text-gray-700";
  };

  const formatDeadline = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil(
      (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return "Deadline passed";
    if (diffDays === 0) return "Due today!";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-foreground/60 text-sm">
            Finding your perfect matches...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-1">
            Your Matches
          </h1>
          <p className="text-foreground/60">
            {matches.length > 0
              ? `We found ${matches.length} opportunities that match your profile`
              : "We'll find the best opportunities for you"}
          </p>
        </div>
        <button
          onClick={fetchMatches}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {matches.length === 0 && !error && !loading && (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-foreground/30" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            No matches yet
          </h3>
          <p className="text-foreground/60 max-w-sm mx-auto mb-6">
            Go back to your dashboard and click "Find My Matches" to discover
            opportunities tailored for you.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-4">
          {matches.map((match) => {
            const isSaved = savedIds.has(match.opportunity.id);
            const isSaving = savingId === match.opportunity.id;
            const o = match.opportunity;
            const scorePct = Math.round(match.match_score * 100);

            return (
              <div
                key={o.id}
                className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${typeBadgeColor(o.opportunity_type)}`}
                      >
                        {o.opportunity_type}
                      </span>
                      <span className="text-xs text-foreground/50">
                        Match: {scorePct}%
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      {o.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-foreground/60">
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
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          Remote
                        </span>
                      )}
                      {o.application_deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDeadline(o.application_deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center ${
                        scorePct >= 80
                          ? "bg-green-100 text-green-700"
                          : scorePct >= 60
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-foreground/50"
                      }`}
                    >
                      <span className="font-heading font-bold text-lg">
                        {scorePct}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                  {o.description}
                </p>

                {/* AI Explanation */}
                {match.ai_explanation && (
                  <div className="bg-muted rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground/80">
                        {match.ai_explanation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Skills tags */}
                {o.required_skills && o.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {o.required_skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2.5 py-1 bg-primary/5 text-primary rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {o.required_skills.length > 6 && (
                      <span className="text-xs text-foreground/40 py-1">
                        +{o.required_skills.length - 6} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  {o.url && (
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Learn more
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleSave(match)}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                      isSaved
                        ? "text-accent bg-accent/10 hover:bg-accent/15"
                        : "text-foreground/60 hover:text-accent hover:bg-accent/5"
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isSaved ? "fill-accent" : ""}`}
                    />
                    {isSaved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
