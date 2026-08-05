import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  ExternalLink,
  Trash2,
  CheckCircle2,
  XCircle,
  Hourglass,
  Send,
  CalendarClock,
  Sparkles,
  Plus,
  X,
  ChevronDown,
  Bookmark,
} from "lucide-react";

interface TrackedApp {
  id: string;
  opportunity_id: string;
  status: string;
  saved_at: string;
  notes: string | null;
  opportunity: {
    title: string;
    organization: string;
    location: string | null;
    is_remote: boolean;
    url: string | null;
    application_deadline: string | null;
    opportunity_type: string;
  } | null;
}

const STATUSES = [
  { value: "saved", label: "Saved", color: "bg-accent/10 text-accent", icon: Bookmark },
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-700", icon: Send },
  { value: "interviewing", label: "Interviewing", color: "bg-purple-100 text-purple-700", icon: Hourglass },
  { value: "accepted", label: "Accepted", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  { value: "rejected", label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
] as const;

export default function ApplicationTracker() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<TrackedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAppId, setNewAppId] = useState("");
  const [availableOpps, setAvailableOpps] = useState<TrackedApp["opportunity"][]>([]);

  const fetchApps = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("saved_opportunities")
      .select(`id, opportunity_id, status, saved_at, notes, opportunity:opportunities(title, organization, location, is_remote, url, application_deadline, opportunity_type)`)
      .eq("user_id", profile.id)
      .order("saved_at", { ascending: false });

    if (!error && data) {
      setApps(data as unknown as TrackedApp[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Load opportunities not yet tracked for the "add" dropdown
  useEffect(() => {
    if (!showAdd || !profile) return;
    const trackedIds = apps.map((a) => a.opportunity_id);
    supabase
      .from("opportunities")
      .select("id, title, organization, location, is_remote, url, application_deadline, opportunity_type")
      .eq("is_active", true)
      .limit(100)
      .then(({ data }) => {
        if (data) {
          setAvailableOpps(
            (data as unknown as (TrackedApp["opportunity"] & { id: string })[])
              .filter((o) => !trackedIds.includes(o.id))
              .slice(0, 50)
          );
        }
      });
  }, [showAdd, profile, apps]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("saved_opportunities").update({ status }).eq("id", id);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const updateNotes = async (id: string, notes: string) => {
    await supabase.from("saved_opportunities").update({ notes }).eq("id", id);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, notes } : a)));
  };

  const removeApp = async (id: string) => {
    await supabase.from("saved_opportunities").delete().eq("id", id);
    setApps((prev) => prev.filter((a) => a.id !== id));
  };

  const addToTracker = async (opportunityId: string) => {
    if (!profile || !opportunityId) return;
    await supabase.from("saved_opportunities").insert({
      user_id: profile.id,
      opportunity_id: opportunityId,
      status: "saved",
    });
    setNewAppId("");
    setShowAdd(false);
    fetchApps();
  };

  const formatDeadline = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Deadline passed";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUSES) counts[s.value] = 0;
    for (const a of apps) counts[a.status] = (counts[a.status] || 0) + 1;
    return counts;
  }, [apps]);

  const pipeline = STATUSES.map((s) => ({
    ...s,
    count: stats[s.value] || 0,
    apps: apps.filter((a) => a.status === s.value),
  }));

  const typeBadge: Record<string, string> = {
    internship: "bg-blue-100 text-blue-700",
    scholarship: "bg-green-100 text-green-700",
    hackathon: "bg-purple-100 text-purple-700",
    job: "bg-rose-100 text-rose-700",
    fellowship: "bg-teal-100 text-teal-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              Application Tracker
            </h1>
            <p className="text-foreground/60">
              Manage your full application pipeline in one place
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add to Tracker
        </button>
      </div>

      {/* Add dropdown */}
      {showAdd && (
        <div className="mb-8 bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-heading font-semibold text-foreground text-sm">
              Add an opportunity to your tracker
            </p>
            <button
              onClick={() => setShowAdd(false)}
              className="p-1.5 rounded-lg hover:bg-muted cursor-pointer text-foreground/50"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <select
              value={newAppId}
              onChange={(e) => setNewAppId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer appearance-none"
            >
              <option value="">Select an opportunity...</option>
              {availableOpps.map((o) => (
                <option key={o?.id} value={o?.id}>
                  {o?.title} — {o?.organization}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
          </div>
          <button
            onClick={() => addToTracker(newAppId)}
            disabled={!newAppId}
            className="mt-3 w-full py-2.5 bg-accent text-white font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer disabled:opacity-40"
          >
            Add
          </button>
        </div>
      )}

      {/* Pipeline stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {pipeline.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.value}
              className="bg-white border border-border rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className={`w-4 h-4 ${s.color.split(" ")[1] || ""}`} />}
                <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                  {s.label}
                </span>
              </div>
              <p className="text-3xl font-heading font-bold text-foreground">
                {s.count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {apps.length === 0 && (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            Your pipeline is empty
          </h3>
          <p className="text-foreground/60 max-w-sm mx-auto mb-6">
            Add opportunities you're interested in, then track them as you
            apply, interview, and (hopefully) get accepted.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Your First Application
          </button>
        </div>
      )}

      {/* Pipeline columns */}
      {apps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {pipeline.map((col) => (
            <div key={col.value} className="bg-muted/50 rounded-2xl p-3 min-h-[200px]">
              <div className="flex items-center gap-2 px-2 py-2 mb-3">
                {col.icon && <col.icon className={`w-4 h-4 ${col.color.split(" ")[1] || ""}`} />}
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                  {col.label}
                </span>
                <span className="ml-auto text-xs text-foreground/40">{col.count}</span>
              </div>
              <div className="space-y-3">
                {col.apps.length === 0 && (
                  <p className="text-xs text-foreground/30 text-center py-6">
                    Nothing here yet
                  </p>
                )}
                {col.apps.map((app) => {
                  const o = app.opportunity;
                  return (
                    <div
                      key={app.id}
                      className="bg-white border border-border rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            typeBadge[o?.opportunity_type || ""] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {o?.opportunity_type || "opportunity"}
                        </span>
                        <button
                          onClick={() => removeApp(app.id)}
                          className="p-1 text-foreground/30 hover:text-destructive rounded cursor-pointer transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-heading font-semibold text-sm text-foreground leading-snug mb-1">
                        {o?.title || "Untitled opportunity"}
                      </h4>
                      <p className="text-xs text-foreground/60 flex items-center gap-1 mb-2">
                        <Building2 className="w-3 h-3" />
                        {o?.organization || "—"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/50 mb-3">
                        {o?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {o.location}
                          </span>
                        )}
                        {o?.application_deadline && (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" />
                            {formatDeadline(o.application_deadline)}
                          </span>
                        )}
                      </div>
                      {o?.url && (
                        <a
                          href={o.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mb-3 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View listing
                        </a>
                      )}
                      <div className="border-t border-border pt-3">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className="w-full text-xs font-medium bg-transparent border border-border rounded-lg px-2 py-1.5 outline-none cursor-pointer text-foreground/80 focus:border-primary"
                          aria-label="Update status"
                        >
                          {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <input
                          value={app.notes || ""}
                          onChange={(e) => updateNotes(app.id, e.target.value)}
                          placeholder="Add a note..."
                          className="mt-2 w-full text-xs bg-transparent border border-border rounded-lg px-2 py-1.5 outline-none text-foreground placeholder:text-foreground/30 focus:border-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer hint */}
      {apps.length > 0 && (
        <div className="mt-8 bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/70">
            <span className="font-medium text-foreground">Pro tip:</span>{" "}
            Save opportunities from any finder page and they'll appear here.
            Keep your statuses updated and use notes to track interview prep or
            follow-ups.
          </p>
        </div>
      )}
    </div>
  );
}
