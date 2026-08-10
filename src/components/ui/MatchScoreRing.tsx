import { useEffect, useState } from "react";

interface MatchScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function MatchScoreRing({
  score,
  size = "md",
  showLabel = true,
}: MatchScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const radius = size === "sm" ? 24 : size === "md" ? 36 : 48;
  const strokeWidth = size === "sm" ? 4 : size === "md" ? 5 : 6;

  const dimensions = {
    sm: { size: 64, textClass: "text-lg" },
    md: { size: 88, textClass: "text-2xl" },
    lg: { size: 120, textClass: "text-4xl" },
  }[size];

  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);

    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 85) return "#10B981";
    if (s >= 70) return "#2563EB";
    if (s >= 50) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{
        width: dimensions.size,
        height: dimensions.size,
      }}
    >
      <svg
        width={dimensions.size}
        height={dimensions.size}
        viewBox={`0 0 ${dimensions.size} ${dimensions.size}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />

        {/* Progress circle */}
        <circle
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-bold ${dimensions.textClass} text-foreground`}
        >
          {animatedScore}
        </span>

        {showLabel && size !== "sm" && (
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
            MATCH
          </span>
        )}
      </div>
    </div>
  );
}