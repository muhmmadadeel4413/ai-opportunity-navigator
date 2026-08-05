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
  Search,
  Filter,
  GraduationCap,
  Zap,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

interface Opportunity {
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
  similarity?: number;
}

interface PageProps {
  type: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  gradient: string;
}

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

export function OpportunityFinder({ type, title, description, icon: Icon, gradient }: PageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGapAnalysis, setShowGapAnalysis] = useState<string | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<Record<string, { missing: string[]; match: string[]; score: number }>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("opportunities")
        .select("*")
        .eq("opportunity_type", type)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setOpportunities(data || []);
      }
    } catch {
      setError("Failed to load opportunities. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOpportunities();
    supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .eq("user_id", user?.id || "")
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((s) => s.opportunity_id)));
      });
  }, [type]);

  const filteredOpps = searchQuery.trim()
    ? opportunities.filter(
        (o) =>
          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          o.required_skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : opportunities;

  const handleSave = async (opp: Opportunity) => {
    if (!user) return;
    setSavingId(opp.id);
    if (savedIds.has(opp.id)) {
      await supabase
        .from("saved_opportunities")
        .delete()
        .eq("user_id", user.id)
        .eq("opportunity_id", opp.id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(opp.id);
        return next;
      });
    } else {
      await supabase.from("saved_opportunities").insert({
        user_id: user.id,
        opportunity_id: opp.id,
      });
      setSavedIds((prev) => new Set(prev).add(opp.id));
    }
    setSavingId(null);
  };

  const runSkillsGapAnalysis = async (opp: Opportunity) => {
    if (!user) return;
    setAnalyzingId(opp.id);
    
    // Fetch user's skills from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("technical_skills, soft_skills")
      .eq("id", user.id)
      .single();

    const userSkills = new Set([
      ...(profile?.technical_skills || []),
      ...(profile?.soft_skills || []),
    ].map(s => s.toLowerCase()));

    const required = opp.required_skills || [];
    const preferred = opp.preferred_skills || [];
    const allRequired = [...required, ...preferred];

    const matching: string[] = [];
    const missing: string[] = [];

    for (const skill of allRequired) {
      if (userSkills.has(skill.toLowerCase())) {
        matching.push(skill);
      } else {
        missing.push(skill);
      }
    }

    const score = allRequired.length > 0
      ? Math.round((matching.length / allRequired.length) * 100)
      : 50;

    setGapAnalysis((prev) => ({
      ...prev,
      [opp.id]: { missing, match: matching, score },
    }));
    setShowGapAnalysis(opp.id);
    setAnalyzingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-foreground/60 text-sm">Loading {title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              {title}
            </h1>
            <p className="text-foreground/60">{description}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/40" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <button
          onClick={fetchOpportunities}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground/60 hover:text-primary bg-white border border-border rounded-xl hover:border-primary/30 transition-all cursor-pointer"
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

      {/* Results */}
      {filteredOpps.length === 0 && !error && (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-foreground/30" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            No {title.toLowerCase()} found
          </h3>
          <p className="text-foreground/60 max-w-sm mx-auto">
            {searchQuery
              ? "Try a different search term."
              : `No ${title.toLowerCase()} are currently available. Check back later!`}
          </p>
        </div>
      )}

      {/* Opportunity Cards */}
      <div className="space-y-4">
        {filteredOpps.map((opp) => {
          const isSaved = savedIds.has(opp.id);
          const isSaving = savingId === opp.id;
          const gap = showGapAnalysis === opp.id ? gapAnalysis[opp.id] : null;

          return (
            <div
              key={opp.id}
              className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${typeBadgeColor(opp.opportunity_type)}`}>
                      {opp.opportunity_type}
                    </span>
                    {opp.similarity !== undefined && (
                      <span className="text-xs text-foreground/50">
                        Match: {Math.round(opp.similarity * 100)}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    {opp.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-foreground/60">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {opp.organization}
                    </span>
                    {opp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {opp.location}
                      </span>
                    )}
                    {opp.is_remote && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Remote</span>
                    )}
                    {opp.application_deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDeadline(opp.application_deadline)}
                      </span>
                    )}
                    {opp.compensation && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {opp.compensation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                {opp.description}
              </p>

              {/* Skills */}
              {opp.required_skills && opp.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {opp.required_skills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2.5 py-1 bg-primary/5 text-primary rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {opp.required_skills.length > 6 && (
                    <span className="text-xs text-foreground/40 py-1">
                      +{opp.required_skills.length - 6} more
                    </span>
                  )}
                </div>
              )}

              {/* Skills Gap Analysis */}
              {gap && (
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-accent" />
                    <span className="font-medium text-sm text-foreground">Skills Gap Analysis</span>
                    <span className={`ml-auto text-sm font-semibold ${
                      gap.score >= 70 ? 'text-green-600' : gap.score >= 40 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {gap.score}% Match
                    </span>
                  </div>
                  {gap.match.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Skills you have:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {gap.match.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gap.missing.length > 0 && (
                    <div>
                      <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Skills to develop:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {gap.missing.map((s) => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border flex-wrap">
                {opp.url && (
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Learn more
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => runSkillsGapAnalysis(opp)}
                  disabled={analyzingId === opp.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/5 rounded-xl transition-all cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  {analyzingId === opp.id ? "Analyzing..." : "Skills Gap"}
                </button>
                <button
                  onClick={() => handleSave(opp)}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ml-auto ${
                    isSaved
                      ? "text-accent bg-accent/10 hover:bg-accent/15"
                      : "text-foreground/60 hover:text-accent hover:bg-accent/5"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-accent" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}