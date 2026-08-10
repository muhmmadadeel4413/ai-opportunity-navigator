import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
  change?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  change,
  onClick,
}: StatCardProps) {
  return (
    <div
      className="bg-card border border-border rounded-card p-5 hover:shadow-elevated transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>

        {trend !== "neutral" && (
          <span
            className={`text-xs font-medium flex items-center gap-0.5 ${
              trend === "up" ? "text-accent" : "text-destructive"
            }`}
          >
            {trend === "up" ? "↑" : "↓"}
            {change}
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-foreground">
        {value}
      </p>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {label}
      </p>

      {change && trend === "neutral" && (
        <p className="text-xs text-gray-400 mt-1">
          {change}
        </p>
      )}
    </div>
  );
}