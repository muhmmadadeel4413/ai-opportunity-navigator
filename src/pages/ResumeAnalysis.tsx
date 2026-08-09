import { useState } from "react";
import {
  FileText,
  Sparkles,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { callAI } from "../lib/ai";

export default function ResumeAnalysis() {
  const { user, profile, refreshProfile } = useAuth();

  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const hasResume =
    !!profile?.resume_text || !!profile?.resume_url;

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !user) {
      return;
    }

    // Reset previous upload state immediately
    setUploading(true);
    setUploadSuccess(false);
    setError("");
    setAnalysis("");

    try {
      // ─────────────────────────────────────
      // Validate PDF
      // ─────────────────────────────────────

      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        throw new Error(
          "Please upload a PDF resume only."
        );
      }

      // ─────────────────────────────────────
      // Upload PDF to Supabase Storage
      // ─────────────────────────────────────

      const filePath = `${user.id}/resume.pdf`;

      const { error: uploadError } =
        await supabase.storage
          .from("resumes")
          .upload(filePath, file, {
            upsert: true,
            contentType: "application/pdf",
          });

      if (uploadError) {
        throw uploadError;
      }

      // ─────────────────────────────────────
      // Get public URL
      // ─────────────────────────────────────

      const { data: urlData } =
        supabase.storage
          .from("resumes")
          .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error(
          "Could not create resume URL."
        );
      }

      // ─────────────────────────────────────
      // Get authenticated session
      // ─────────────────────────────────────

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      // ─────────────────────────────────────
      // Convert PDF to Base64
      // ─────────────────────────────────────

      const arrayBuffer =
        await file.arrayBuffer();

      const uint8Array =
        new Uint8Array(arrayBuffer);

      let binary = "";

      const chunkSize = 8192;

      for (
        let i = 0;
        i < uint8Array.length;
        i += chunkSize
      ) {
        const chunk = uint8Array.subarray(
          i,
          i + chunkSize
        );

        binary += String.fromCharCode(...chunk);
      }

      const base64Pdf = btoa(binary);

      // ─────────────────────────────────────
      // Parse PDF with Gemini
      // ─────────────────────────────────────

      const parseResponse = await fetch(
        "https://bficpbbezccjpdifzxek.supabase.co/functions/v1/parse-resume",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            pdf_base64: base64Pdf,
            file_name: file.name,
          }),
        }
      );

      const parseResult =
        await parseResponse.json();

      if (!parseResponse.ok) {
        throw new Error(
          parseResult?.error ||
            "Failed to parse your resume."
        );
      }

      const parsed = parseResult?.data;

      if (!parsed) {
        throw new Error(
          "Resume parser returned no data."
        );
      }

      // ─────────────────────────────────────
      // Get extracted resume text
      // ─────────────────────────────────────

      const resumeText =
        parsed.resume_text || "";

      if (!resumeText.trim()) {
        throw new Error(
          "Could not extract text from this PDF. Please make sure your resume contains selectable text."
        );
      }

      // ─────────────────────────────────────
      // Save parsed resume to profile
      // ─────────────────────────────────────

      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            resume_text: resumeText,
            resume_url: urlData.publicUrl,
          })
          .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      // ─────────────────────────────────────
      // Refresh profile
      // ─────────────────────────────────────

      await refreshProfile();

      // New resume successfully uploaded
      setUploadSuccess(true);
      setError("");
    } catch (err) {
      console.error(
        "Resume upload error:",
        err
      );

      setUploadSuccess(false);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload resume. Please try again."
      );
    } finally {
      setUploading(false);

      // Allow selecting the same file again
      e.target.value = "";
    }
  };

  // ─────────────────────────────────────────
  // Analyze Resume
  // ─────────────────────────────────────────

  const analyzeResume = async () => {
    if (!user) {
      setError(
        "Please sign in again."
      );
      return;
    }

    if (!profile?.resume_text) {
      setError(
        "Please upload your resume first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const result = await callAI({
        mode: "resume_analysis",
      });

      setAnalysis(
        result.content || ""
      );
    } catch (err) {
      console.error(
        "Resume analysis error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>

          <h1 className="font-heading font-bold text-2xl text-foreground">
            Resume Analysis
          </h1>
        </div>

        <p className="text-foreground/60">
          Upload your resume and get AI-powered feedback
        </p>
      </div>

      {/* Upload Card */}

      <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm mb-6">
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
          <Upload className="w-10 h-10 text-foreground/30 mx-auto mb-3" />

          <p className="text-sm text-foreground/60 mb-2">
            {hasResume
              ? "Upload a new PDF resume to replace your current resume"
              : "Upload your resume (PDF)"}
          </p>

          {/* Success message */}

          {uploadSuccess && !uploading && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 mb-4">
              <CheckCircle2 className="w-4 h-4" />
              New resume uploaded successfully
            </div>
          )}

          {/* Existing resume */}

          {hasResume &&
            !uploadSuccess &&
            !uploading && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 mb-4">
                <CheckCircle2 className="w-4 h-4" />
                Current resume is uploaded
              </div>
            )}

          {/* Upload / Replace button */}

          <label
            className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.97] transition-all ${
              uploading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}

            {uploading
              ? "Processing New Resume..."
              : hasResume
              ? "Replace Resume"
              : "Upload Resume"}

            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          <p className="text-xs text-foreground/40 mt-3">
            PDF files only
          </p>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Analyze Button */}

      {hasResume && (
        <button
          type="button"
          onClick={analyzeResume}
          disabled={
            loading ||
            uploading ||
            !profile?.resume_text
          }
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze My Resume
            </>
          )}
        </button>
      )}

      {/* Analysis */}

      {analysis && (
        <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-emerald-600">
            <Sparkles className="w-5 h-5" />

            <span className="font-heading font-semibold">
              AI Resume Analysis
            </span>
          </div>

          <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">
            {analysis}
          </div>
        </div>
      )}

      {/* No Resume */}

      {!hasResume &&
        !analysis &&
        !uploading && (
          <div className="text-center py-16 bg-white border border-border rounded-2xl">
            <FileText className="w-16 h-16 text-foreground/20 mx-auto mb-4" />

            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              No Resume Yet
            </h3>

            <p className="text-foreground/60 max-w-sm mx-auto">
              Upload your resume to get detailed AI feedback.
            </p>
          </div>
        )}
    </div>
  );
}

