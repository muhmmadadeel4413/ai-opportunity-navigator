import { useState, useEffect } from "react";
import { LineChart, Sparkles, RefreshCw, Loader2, BookOpen, Target, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { callAI } from "../lib/ai";

export default function AIRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const generateRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const result = await callAI({ mode: "recommendations" });
      setRecommendations(result.content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate recommendations. Please try again."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    generateRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
            <LineChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              AI Recommendations
            </h1>
            <p className="text-foreground/60">
              Personalized recommendations to advance your career
            </p>
          </div>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && !recommendations && (
        <div className="mb-6 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {loading && !recommendations && (
        <div className="bg-white border border-border rounded-2xl p-10 text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground/60">Analyzing your profile for personalized recommendations...</p>
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        {recommendations ? (
          <div>
            <div className="flex items-center gap-2 mb-6 text-accent">
              <Sparkles className="w-5 h-5" />
              <span className="font-heading font-semibold">AI-Powered Recommendations</span>
            </div>
            <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">
              {recommendations}
            </div>
          </div>
        ) : !error ? (
          <div className="text-center py-10">
            <LineChart className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
            <p className="text-foreground/60">No recommendations generated yet.</p>
          </div>
        ) : null}
      </div>

      {recommendations && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border border-border rounded-xl p-4">
            <BookOpen className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs text-foreground/50">Skills</p>
            <p className="text-sm font-semibold text-foreground">What to learn next</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <Target className="w-5 h-5 text-accent mb-2" />
            <p className="text-xs text-foreground/50">Opportunities</p>
            <p className="text-sm font-semibold text-foreground">Where to focus</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <Users className="w-5 h-5 text-secondary mb-2" />
            <p className="text-xs text-foreground/50">Network</p>
            <p className="text-sm font-semibold text-foreground">How to connect</p>
          </div>
        </div>
      )}
    </div>
  );
}