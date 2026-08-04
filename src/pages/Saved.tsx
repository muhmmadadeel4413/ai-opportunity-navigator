import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  Bookmark,
  MapPin,
  Clock,
  ExternalLink,
  Building2,
  Sparkles,
  Trash2,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowLeft,
} from "lucide-react";

interface SavedOpp {
  id: string;
  opportunity_id: string;
  match_score: number | null;
  ai_explanation: string | null;
  status: string;
  saved_at: string;
  opportunity: {
    title: string;
    description: string;
    opportunity_type: string;
    organization: string;
    location: string | null;
    is_remote: boolean;
    url: string | null;
    application_deadline: string | null;
    required_skills: string[];
    compensation: string | null;
    duration: string | null;
    tags: string[];
  };
}

const statusIcons: Record<string, typeof Clock3> = {
  saved: Bookmark,
  applied: CheckCircle2,
  interviewing: Clock3,
  accepted: CheckCircle2,
  rejected: XCircle,
  archived: Bookmark,
};

const statusColors: Record<string, string> = {
  saved: "bg-accent/10 text-accent",
  applied: "bg-blue-100 text-blue-700",
  interviewing: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-destructive/10 text-destructive",
  archived: "bg-gray-100 text-gray-500",
};

export function Saved() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState<SavedOpp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    const { data, error } = await supabase
      .from("saved_opportunities")
      .select(
        `*, opportunity:opportunities(*)`
      )
      .eq("user_id", profile!.id)
      .order("saved_at", { ascending: false });

    if (!error && data) {
      setSaved(data as unknown as SavedOpp[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from("saved_opportunities")
      .update({ status })
      .eq("id", id);
    setSaved((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const removeSaved = async (id: string) => {
    await supabase
      .from("saved_opportunities")
      .delete()
      .eq("id", id);
    setSaved((prev) => prev.filter((s) => s.id !== id));
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
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
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

      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-1">
          Saved Opportunities
        </h1>
        <p className="text-foreground/60">
          {saved.length === 0
            ? "Save opportunities from your matches to track them here"
            : `You have ${saved.length} saved opportunities`}
        </p>
      </div>

      {saved.length === 0 && (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-foreground/30" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            Nothing saved yet
          </h3>
          <p className="text-foreground/60 max-w-sm mx-auto mb-6">
            When you find an opportunity you like, click the save button to keep
            track of it here. You can also update the status as you progress.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Find Opportunities
          </button>
        </div>
      )}

      {saved.length > 0 && (
        <div className="space-y-4">
          {saved.map((s) => {
            const o = s.opportunity;
            const StatusIcon =
              statusIcons[s.status] || Bookmark;
            const statusColor = statusColors[s.status] || "";
            const scorePct = s.match_score
              ? Math.round(s.match_score * 100)
              : null;

            return (
              <div
                key={s.id}
                className="bg-white border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${typeBadgeColor(o.opportunity_type)}`}
                      >
                        {o.opportunity_type}
                      </span>
                      {scorePct !== null && (
                        <span className="text-xs text-foreground/50">
                          {scorePct}% match
                        </span>
                      )}
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
                  <div className="flex items-center gap-2 shrink-0">
                    {o.url && (
                      <a
                        href={o.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-foreground/40 hover:text-primary rounded-lg hover:bg-muted transition-all duration-200 cursor-pointer"
                        title="Open link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => removeSaved(s.id)}
                      className="p-2 text-foreground/40 hover:text-destructive rounded-lg hover:bg-destructive/5 transition-all duration-200 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status dropdown */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      className={`w-4 h-4 ${statusColor.split(" ")[1] || "text-foreground/40"}`}
                    />
                    <select
                      value={s.status}
                      onChange={(e) => updateStatus(s.id, e.target.value)}
                      className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer text-foreground/70 py-1"
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <span className="text-xs text-foreground/40">
                    Saved {new Date(s.saved_at).toLocaleDateString()}
                  </span>
                </div>

                {s.ai_explanation && (
                  <div className="bg-muted rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground/80">
                        {s.ai_explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
