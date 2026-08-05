import { useState } from "react";
import { FileText, Sparkles, Upload, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function ResumeAnalysis() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [hasResume, setHasResume] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError("");

    try {
      const text = await file.text();
      await supabase.from("profiles").update({ resume_text: text }).eq("id", user.id);
      setHasResume(true);
    } catch {
      setError("Failed to upload resume. Please try again.");
    }
    setUploading(false);
  };

  const analyzeResume = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        "https://bficpbbezccjpdifzxek.supabase.co/functions/v1/ai-query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ mode: "resume_analysis", user_id: user.id }),
        }
      );

      const result = await resp.json();
      if (result.error) setError(result.error);
      else setAnalysis(result.data);
    } catch {
      setError("Failed to analyze resume. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">Resume Analysis</h1>
            <p className="text-foreground/60">Upload your resume and get AI-powered feedback</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm mb-6">
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
          <Upload className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-foreground/60 mb-2">Upload your resume (text file)</p>
          {hasResume && <p className="text-xs text-green-600 mb-3">✓ Resume uploaded</p>}
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.97] transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : hasResume ? "Replace Resume" : "Upload Resume"}
            <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {error && <div className="mb-6 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">{error}</div>}

      {hasResume && (
        <button
          onClick={analyzeResume}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg active:scale-[0.97] transition-all disabled:opacity-50 cursor-pointer mb-6"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze My Resume</>}
        </button>
      )}

      {analysis && (
        <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-emerald-600">
            <Sparkles className="w-5 h-5" />
            <span className="font-heading font-semibold">AI Resume Analysis</span>
          </div>
          <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">{analysis}</div>
        </div>
      )}

      {!hasResume && !analysis && (
        <div className="text-center py-16 bg-white border border-border rounded-2xl">
          <FileText className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">No Resume Yet</h3>
          <p className="text-foreground/60 max-w-sm mx-auto">Upload your resume to get detailed AI feedback.</p>
        </div>
      )}
    </div>
  );
}