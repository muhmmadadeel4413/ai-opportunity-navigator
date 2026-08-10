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
  Send,
  Hourglass,
  XCircle,
  Bookmark,
  FileText,
} from "lucide-react";

interface SavedWithDeadline {
  id: string;
  opportunity_id: string;
  status: string;
  notes: string | null;
  saved_at: string;
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
    const diffDays = Math.ceil(
      diffMs / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      overdue.push(item);
    } else if (diffDays <= 3) {
      dueSoon.push(item);
    } else if (diffDays <= 14) {
      upcoming.push(item);
    } else {
      later.push(item);
    }
  }

  return { overdue, dueSoon, upcoming, later };
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    icon: typeof Bookmark;
  }
> = {
  saved: {
    label: "Saved",
    color: "bg-accent/10 text-accent",
    icon: Bookmark,
  },
  applied: {
    label: "Applied",
    color: "bg-blue-100 text-blue-700",
    icon: Send,
  },
  interviewing: {
    label: "Interviewing",
    color: "bg-purple-100 text-purple-700",
    icon: Hourglass,
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

const TYPE_BADGES: Record<string, string> = {
  internship: "bg-blue-100 text-blue-700",
  scholarship: "bg-green-100 text-green-700",
  hackathon: "bg-purple-100 text-purple-700",
  certification: "bg-amber-100 text-amber-700",
  job: "bg-rose-100 text-rose-700",
  fellowship: "bg-teal-100 text-teal-700",
  volunteer: "bg-orange-100 text-orange-700",
};

export default function DeadlineReminders() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<SavedWithDeadline[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;

    setLoading(true);
    setError("");

    supabase
      .from("saved_opportunities")
      .select(
        `
          id,
          opportunity_id,
          status,
          notes,
          saved_at,
          opportunity:opportunities(
            title,
            organization,
            location,
            is_remote,
            url,
            application_deadline,
            opportunity_type
          )
        `
      )
      .eq("user_id", profile.id)
      .not("opportunity.application_deadline", "is", null)
      .order("saved_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load deadlines:", error);
          setError("Failed to load your deadlines. Please try again.");
          setSaved([]);
        } else if (data) {
          setSaved(data as unknown as SavedWithDeadline[]);
        }

        setLoading(false);
      });
  }, [profile]);

  const { overdue, dueSoon, upcoming, later } =
    groupByTimeframe(saved);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();

    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(
      diffMs / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "Deadline passed";
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

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-5" />
          <p className="text-foreground/60">
            Loading your deadline reminders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Back */}
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
              Never miss an application deadline. Your saved opportunities,
              application status, and notes are all connected.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 border border-destructive/10">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Overdue",
            count: overdue.length,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
          {
            label: "Due Soon",
            count: dueSoon.length,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Upcoming",
            count: upcoming.length,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Later",
            count: later.length,
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-border rounded-2xl p-4 shadow-sm"
          >
            <p
              className={`text-3xl font-heading font-bold ${stat.color} mb-1`}
            >
              {stat.count}
            </p>

            <p className="text-xs text-foreground/60">
              {stat.label}
            </p>
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
            Save opportunities with application deadlines, and they'll
            appear here sorted by urgency.
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
        <Section
          title="Overdue"
          icon={AlertTriangle}
          color="text-destructive"
        >
          {overdue.map((item) => {
            if (!item.opportunity) return null;

            return (
              <DeadlineCard
                key={item.id}
                item={item}
                formatDate={formatDate}
              />
            );
          })}
        </Section>
      )}

      {/* Due Soon */}
      {dueSoon.length > 0 && (
        <Section
          title="Due Soon"
          icon={Clock}
          color="text-amber-600"
        >
          {dueSoon.map((item) => {
            if (!item.opportunity) return null;

            return (
              <DeadlineCard
                key={item.id}
                item={item}
                formatDate={formatDate}
              />
            );
          })}
        </Section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Section
          title="Upcoming (next 2 weeks)"
          icon={CalendarClock}
          color="text-blue-600"
        >
          {upcoming.map((item) => {
            if (!item.opportunity) return null;

            return (
              <DeadlineCard
                key={item.id}
                item={item}
                formatDate={formatDate}
              />
            );
          })}
        </Section>
      )}

      {/* Later */}
      {later.length > 0 && (
        <Section
          title="Later"
          icon={CheckCircle2}
          color="text-green-600"
        >
          {later.map((item) => {
            if (!item.opportunity) return null;

            return (
              <DeadlineCard
                key={item.id}
                item={item}
                formatDate={formatDate}
              />
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
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${color}`} />

        <h2 className="font-heading font-semibold text-lg text-foreground">
          {title}
        </h2>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function DeadlineCard({
  item,
  formatDate,
}: {
  item: SavedWithDeadline;
  formatDate: (d: string) => string;
}) {
  const opp = item.opportunity!;

  const status =
    STATUS_CONFIG[item.status] || STATUS_CONFIG.saved;

  const StatusIcon = status.icon;

  const typeBadge =
    TYPE_BADGES[opp.opportunity_type] ||
    "bg-gray-100 text-gray-700";

  return (
    <div
      className={`bg-white border border-border rounded-2xl p-5 shadow-sm border-l-4 ${
        item.status === "rejected"
          ? "opacity-75"
          : ""
      }`}
      style={{ borderLeftColor: "var(--color-accent)" }}
    >
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Opportunity type */}
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${typeBadge}`}
            >
              {opp.opportunity_type}
            </span>

            {/* Application status */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}
            >
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>

          <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
            {opp.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
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
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                Remote
              </span>
            )}
          </div>
        </div>

        {/* Deadline */}
        {opp.application_deadline && (
          <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-700">
            <CalendarClock className="w-4 h-4" />

            <div>
              <p className="text-xs font-semibold">
                {formatDate(opp.application_deadline)}
              </p>

              <p className="text-[10px] text-amber-600/70">
                Application deadline
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Application status section */}
      <div className="bg-muted/50 border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusIcon className="w-4 h-4 text-primary" />

          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            Application Status
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg ${status.color}`}
        >
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </span>
      </div>

      {/* Notes */}
      {item.notes && item.notes.trim() && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />

            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary mb-1">
                Your Note
              </p>

              <p className="text-sm text-foreground/75 whitespace-pre-wrap break-words">
                {item.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
        {opp.url && (
          <a
            href={opp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            View Opportunity
          </a>
        )}

        <span className="text-xs text-foreground/40">
          Status and notes are synced with Application Tracker
        </span>
      </div>
    </div>
  );
}