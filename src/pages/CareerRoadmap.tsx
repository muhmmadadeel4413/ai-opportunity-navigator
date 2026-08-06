import { useState, useEffect } from "react";
import { Map, Sparkles, Loader2, RefreshCw, Target, BookOpen, Eye } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { callAI } from "../lib/ai";

export default function CareerRoadmap() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const generateRoadmap = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const result = await callAI({ mode: "career_roadmap" });
      setRoadmap(result.content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate roadmap. Please try again."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    generateRoadmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              Career Roadmap
            </h1>
            <p className="text-foreground/60">
              Your personalized AI-generated career path
            </p>
          </div>
        </div>
        <button
          onClick={generateRoadmap}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {error && !roadmap && (
        <div className="mb-6 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading && !roadmap && (
        <div className="bg-white border border-border rounded-2xl p-10 text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground/60">Analyzing your profile and generating your career roadmap...</p>
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        {roadmap ? (
          <div className="prose prose-sm max-w-none">
            <div className="flex items-center gap-2 mb-6 text-accent">
              <Sparkles className="w-5 h-5" />
              <span className="font-heading font-semibold">Your Career Roadmap</span>
            </div>
            <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">
              {roadmap}
            </div>
          </div>
        ) : !error ? (
          <div className="text-center py-10">
            <Map className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
            <p className="text-foreground/60">No roadmap generated yet.</p>
          </div>
        ) : null}
      </div>

      {roadmap && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border border-border rounded-xl p-4">
            <Target className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs text-foreground/50">Focus</p>
            <p className="text-sm font-semibold text-foreground">Short-term goals</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <BookOpen className="w-5 h-5 text-accent mb-2" />
            <p className="text-xs text-foreground/50">Skills</p>
            <p className="text-sm font-semibold text-foreground">Grow & develop</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-4">
            <Eye className="w-5 h-5 text-secondary mb-2" />
            <p className="text-xs text-foreground/50">Vision</p>
            <p className="text-sm font-semibold text-foreground">Long-term career</p>
          </div>
        </div>
      )}
    </div>
  );
}