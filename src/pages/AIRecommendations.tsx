import { LineChart } from "lucide-react";

export default function AIRecommendations() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
          AI Recommendations
        </h1>
        <p className="text-foreground/60">
          Discover tailored recommendations for courses, skills, and
          opportunities to advance your career.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LineChart className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          AI Recommendations — Coming Soon
        </h3>
        <p className="text-foreground/60 max-w-md mx-auto">
          Based on your profile, goals, and market trends, get smart
          recommendations for skills to learn, courses to take, and
          opportunities to pursue next.
        </p>
      </div>
    </div>
  );
}