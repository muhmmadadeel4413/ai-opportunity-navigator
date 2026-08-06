import { useState, useEffect } from "react";
import { Search, Sparkles, Send, Loader2, Bookmark, Building2, MapPin, Clock, ExternalLink, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { callAI } from "../lib/ai";

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
  required_skills: string[];
  tags: string[];
}

interface SearchCriteria {
  keywords?: string[];
  types?: string[];
  remote_only?: boolean;
  skill_focus?: string[];
  deadline_window?: "any" | "soon" | "this_month";
}

export default function AISmartSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [results, setResults] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((s) => s.opportunity_id)));
      });
  }, [user]);

  const handleSearch = async () => {
    if (!query.trim() || loading || !user) return;

    setLoading(true);
    setError("");
    setSearched(true);
    setAiResponse("");
    setCriteria(null);

    try {
      // 1) AI interprets the natural-language query into structured criteria
      const result = await callAI({ mode: "smart_search", query: query.trim() });
      setAiResponse(result.content);

      const parsed = result.data as { criteria?: SearchCriteria } | null;
      const c: SearchCriteria = parsed?.criteria ?? {};
      setCriteria(c);

      const keywords = [...(c.keywords ?? []), ...(c.skill_focus ?? [])]
        .filter(Boolean)
        .map((k) => k.toLowerCase());

      // 2) Query opportunities, apply filters in JS
      const { data: opps } = await supabase
        .from("opportunities")
        .select("*")
        .eq("is_active", true)
        .limit(100);

      if (!opps) {
        setResults([]);
        return;
      }

      const types = c.types?.length ? new Set(c.types.map((t) => t.toLowerCase())) : null;

      let filtered = (opps as Opportunity[]).filter((o) => {
        if (types && !types.has(o.opportunity_type.toLowerCase())) return false;
        if (c.remote_only && !o.is_remote) return false;
        return true;
      });

      // Keyword scoring
      if (keywords.length > 0) {
        const scored = filtered.map((o) => {
          const haystack = [
            o.title,
            o.description,
            o.organization,
            ...(o.required_skills ?? []),
            ...(o.tags ?? []),
          ]
            .join(" ")
            .toLowerCase();
          const hits = keywords.filter((k) => haystack.includes(k)).length;
          return { o, hits };
        });
        scored.sort((a, b) => b.hits - a.hits);
        filtered = scored.filter((s) => s.hits > 0).map((s) => s.o);
        if (filtered.length === 0) {
          // fall back to unscored if nothing matched keywords
          filtered = scored.map((s) => s.o);
        }
      }

      // Deadline window filtering
      if (c.deadline_window && c.deadline_window !== "any") {
        const now = new Date();
        const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((o) => {
          if (!o.application_deadline) return c.deadline_window === "any";
          const d = new Date(o.application_deadline);
          if (c.deadline_window === "soon") return d >= now && d.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
          return d >= now && d <= monthFromNow;
        });
      }

      setResults(filtered.slice(0, 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    }
    setLoading(false);
  };

  const handleSave = async (opp: Opportunity) => {
    if (!user) return;
    setSavingId(opp.id);
    if (savedIds.has(opp.id)) {
      await supabase
        .from("saved_opportunities")
        .delete()
        .eq("user_id", user.id)
        .eq("opportunity_id", opp.id);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(opp.id); return n; });
    } else {
      await supabase.from("saved_opportunities").insert({ user_id: user.id, opportunity_id: opp.id });
      setSavedIds((prev) => new Set(prev).add(opp.id));
    }
    setSavingId(null);
  };

  const formatDeadline = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Deadline passed";
    if (diffDays === 0) return "Due today!";
    if (diffDays <= 7) return `${diffDays} days left`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const typeBadgeColor = (type: string) => {
    const map: Record<string, string> = {
      internship: "bg-blue-100 text-blue-700",
      scholarship: "bg-green-100 text-green-700",
      hackathon: "bg-purple-100 text-purple-700",
      job: "bg-rose-100 text-rose-700",
      fellowship: "bg-teal-100 text-teal-700",
    };
    return map[type] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              AI Smart Search
            </h1>
            <p className="text-foreground/60">Describe what you're looking for in natural language</p>
          </div>
        </div>
      </div>

      {/* Search input */}
      <div className="bg-white border border-border rounded-2xl p-4 md:p-6 shadow-sm mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder='e.g. "remote machine learning internships" or "scholarships for women in tech"'
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* AI interpretation */}
      {aiResponse && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">AI understands:</p>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{aiResponse}</p>
              {criteria?.types && criteria.types.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {criteria.types.map((t) => (
                    <span key={t} className={`text-xs px-2.5 py-1 rounded-full capitalize ${typeBadgeColor(t)}`}>
                      {t}
                    </span>
                  ))}
                  {criteria.remote_only && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">Remote</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <>
          <p className="text-sm text-foreground/60 mb-4">
            {results.length > 0
              ? `Found ${results.length} matching opportunities`
              : "No matching opportunities found. Try a different search."}
          </p>

          <div className="space-y-4">
            {results.map((opp) => (
              <div key={opp.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${typeBadgeColor(opp.opportunity_type)}`}>
                      {opp.opportunity_type}
                    </span>
                    <h3 className="font-heading font-semibold text-lg text-foreground mt-1">{opp.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-foreground/60">
                      <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{opp.organization}</span>
                      {opp.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{opp.location}</span>}
                      {opp.is_remote && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Remote</span>}
                      {opp.application_deadline && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDeadline(opp.application_deadline)}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{opp.description}</p>
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {opp.url && (
                    <a href={opp.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer">
                      <ExternalLink className="w-4 h-4" /> Learn more <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleSave(opp)}
                    disabled={savingId === opp.id}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ml-auto ${
                      savedIds.has(opp.id) ? "text-accent bg-accent/10" : "text-foreground/60 hover:text-accent"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${savedIds.has(opp.id) ? "fill-accent" : ""}`} />
                    {savedIds.has(opp.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!searched && (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <Search className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">Search for Opportunities</h3>
          <p className="text-foreground/60 max-w-md mx-auto">
            Describe what you're looking for in your own words. Our AI will find the best matches.
          </p>
        </div>
      )}
    </div>
  );
}