import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  ArrowLeft,
  Bell,
  Clock,
  CalendarClock,
  ExternalLink,
  Building2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface SavedWithDeadline {
  id: string;
  opportunity_id: string;
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

function groupByTimeframe(items: SavedWithDeadline[]) {
  const now = new Date();
  const overdue: SavedWithDeadline[] = [];
  const dueSoon: SavedWithDeadline[] = [];
  const upcoming: SavedWithDeadline[] = [];
  const later: SavedWithDeadline[] = [];

  for (const item of items) {
    const deadlineStr = item.opportunity?.application_deadline;
    if (!deadlineStr) continue;
    const deadline = new Date(deadlineStr);
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) overdue.push(item);
    else if (diffDays <= 3) dueSoon.push(item);
    else if (diffDays <= 14) upcoming.push(item);
    else later.push(item);
  }

  return { overdue, dueSoon, upcoming, later };
}

export default function DeadlineReminders() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<SavedWithDeadline[]>([]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("saved_opportunities")
      .select(
        `id, opportunity_id, opportunity:opportunities(title, organization, location, is_remote, url, application_deadline, opportunity_type)`
      )
      .eq("user_id", profile.id)
      .not("opportunity.application_deadline", "is", null)
      .order("saved_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setSaved(data as unknown as SavedWithDeadline[]);
        }
        setLoading(false);
      });
  }, [profile]);

  const { overdue, dueSoon, upcoming, later } = groupByTimeframe(saved);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today!";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              Deadline Reminders
            </h1>
            <p className="text-foreground/60">
              Never miss an application deadline. All your saved deadlines in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Overdue", count: overdue.length, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Due Soon", count: dueSoon.length, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Upcoming", count: upcoming.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Later", count: later.length, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-border rounded-2xl p-4 shadow-sm"
          >
            <p className={`text-3xl font-heading font-bold ${stat.color} mb-1`}>
              {stat.count}
            </p>
            <p className="text-xs text-foreground/60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {saved.length === 0 && (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            No deadlines to track
          </h3>
          <p className="text-foreground/60 max-w-sm mx-auto mb-6">
            Save opportunities with application deadlines, and they'll appear
            here sorted by urgency.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Browse Opportunities
          </button>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <Section title="Overdue" icon={AlertTriangle} color="text-destructive">
          {overdue.map((item) => {
            const o = item.opportunity;
            if (!o) return null;
            return (
              <DeadlineCard key={item.id} opp={o} badge={typeBadge} formatDate={formatDate} />
            );
          })}
        </Section>
      )}

      {/* Due Soon */}
      {dueSoon.length > 0 && (
        <Section title="Due Soon" icon={Clock} color="text-amber-600">
          {dueSoon.map((item) => {
            const o = item.opportunity;
            if (!o) return null;
            return (
              <DeadlineCard key={item.id} opp={o} badge={typeBadge} formatDate={formatDate} />
            );
          })}
        </Section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Section title="Upcoming (next 2 weeks)" icon={CalendarClock} color="text-blue-600">
          {upcoming.map((item) => {
            const o = item.opportunity;
            if (!o) return null;
            return (
              <DeadlineCard key={item.id} opp={o} badge={typeBadge} formatDate={formatDate} />
            );
          })}
        </Section>
      )}

      {/* Later */}
      {later.length > 0 && (
        <Section title="Later" icon={CheckCircle2} color="text-green-600">
          {later.map((item) => {
            const o = item.opportunity;
            if (!o) return null;
            return (
              <DeadlineCard key={item.id} opp={o} badge={typeBadge} formatDate={formatDate} />
            );
          })}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  color,
  children,
}: {
  title: string;
  icon: typeof Sparkles;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${color}`} />
        <h2 className="font-heading font-semibold text-lg text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DeadlineCard({
  opp,
  badge,
  formatDate,
}: {
  opp: NonNullable<SavedWithDeadline["opportunity"]>;
  badge: Record<string, string>;
  formatDate: (d: string) => string;
}) {
  return (
    <div
      className={`bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4`}
      style={{ borderLeftColor: "var(--color-accent)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                badge[opp.opportunity_type] || "bg-gray-100 text-gray-700"
              }`}
            >
              {opp.opportunity_type}
            </span>
            {opp.application_deadline && (
              <span className="text-xs font-medium text-foreground/70">
                {formatDate(opp.application_deadline)}
              </span>
            )}
          </div>
          <h3 className="font-heading font-semibold text-base text-foreground">
            {opp.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-foreground/60">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {opp.organization}
            </span>
            {opp.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {opp.location}
              </span>
            )}
            {opp.is_remote && (
              <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full">
                Remote
              </span>
            )}
          </div>
        </div>
        {opp.url && (
          <a
            href={opp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            Apply
          </a>
        )}
      </div>
    </div>
  );
}
