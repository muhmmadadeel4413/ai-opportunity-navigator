import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Sparkles,
  Upload, 
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { callAI } from "../lib/ai";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ResumeAnalysis() {
  const { user, profile, refreshProfile } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasResume = !!profile?.resume_text;
  const hasResumeFile = !!profile?.resume_url;

  /*
   * ---------------------------------------------------------
   * Extract text from PDF
   * ---------------------------------------------------------
   */
  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    let fullText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => {
          if ("str" in item) {
            return item.str;
          }

          return "";
        })
        .join(" ");

      fullText += `\n${pageText}`;
    }

    return fullText.trim();
  };

  /*
   * ---------------------------------------------------------
   * Extract text from TXT
   * ---------------------------------------------------------
   */
  const extractTxtText = async (file: File): Promise<string> => {
    return await file.text();
  };

  /*
   * ---------------------------------------------------------
   * Handle resume upload
   * ---------------------------------------------------------
   */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setAnalysis("");

    try {
      /*
       * Validate file type
       */
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      const isTxt =
        file.type === "text/plain" ||
        file.name.toLowerCase().endsWith(".txt");

      if (!isPdf && !isTxt) {
        throw new Error(
          "Please upload a PDF or TXT resume."
        );
      }

      /*
       * Limit file size to 10 MB
       */
      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Resume file must be smaller than 10 MB."
        );
      }

      /*
       * -----------------------------------------------------
       * Extract resume text
       * -----------------------------------------------------
       */

      let resumeText = "";

      if (isPdf) {
        resumeText = await extractPdfText(file);
      } else {
        resumeText = await extractTxtText(file);
      }

      resumeText = resumeText.trim();

      if (!resumeText) {
        throw new Error(
          "Could not extract text from this resume. Please make sure the PDF contains selectable text."
        );
      }

      /*
       * -----------------------------------------------------
       * Upload original file to Supabase Storage
       * -----------------------------------------------------
       */

      const fileExtension = isPdf ? "pdf" : "txt";

      const filePath =
        `${user.id}/resume.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("resumes")
          .upload(filePath, file, {
            upsert: true,
            contentType:
              isPdf
                ? "application/pdf"
                : "text/plain",
          });

      if (uploadError) {
        throw uploadError;
      }

      /*
       * -----------------------------------------------------
       * Get public URL
       * -----------------------------------------------------
       */

      const { data: urlData } =
        supabase.storage
          .from("resumes")
          .getPublicUrl(filePath);

      const resumeUrl =
        urlData?.publicUrl || null;

      /*
       * -----------------------------------------------------
       * Save extracted text + URL to profile
       * -----------------------------------------------------
       */

      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            resume_text: resumeText,
            resume_url: resumeUrl,
          })
          .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      /*
       * Refresh auth/profile state
       */
      await refreshProfile();

      setSuccess(
        "Resume uploaded successfully. You can now analyze it."
      );
    } catch (err) {
      console.error(
        "Resume upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload resume. Please try again."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /*
   * ---------------------------------------------------------
   * Analyze resume with Gemini
   * ---------------------------------------------------------
   */
  const analyzeResume = async () => {
    if (!user) {
      setError(
        "Your session has expired. Please sign in again."
      );
      return;
    }

    if (!profile?.resume_text) {
      setError(
        "No resume text found. Please upload your resume first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setAnalysis("");

    try {
      const result = await callAI({
        mode: "resume_analysis",
      });

      if (!result.content) {
        throw new Error(
          "The AI returned an empty analysis. Please try again."
        );
      }

      setAnalysis(result.content);
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

  /*
   * ---------------------------------------------------------
   * Clear temporary messages
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [success]);

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */
  return (
    <div className="max-w-4xl mx-auto">
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
          from Gemini.
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm mb-6">
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
          <Upload className="w-10 h-10 text-foreground/30 mx-auto mb-3" />

          <h2 className="font-heading font-semibold text-lg text-foreground mb-2">
            Upload Your Resume
          </h2>

          <p className="text-sm text-foreground/60 mb-2">
            Upload your resume as a PDF or TXT file.
          </p>

          <p className="text-xs text-foreground/40 mb-5">
            PDF files with selectable text are recommended.
            Maximum size: 10 MB.
          </p>

          {/* Existing resume */}
          {(hasResume || hasResumeFile) && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-4">
              <CheckCircle2 className="w-4 h-4" />

              <span>
                Resume already uploaded
              </span>
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.97] transition-all cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />

                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />

                {hasResume || hasResumeFile
                  ? "Replace Resume"
                  : "Upload Resume"}
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-6 flex items-center gap-3 bg-green-500/10 text-green-700 text-sm rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      {/* Analyze Button */}
      {hasResume && (
        <div className="mb-6">
          <button
            onClick={analyzeResume}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />

                Analyzing Resume...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />

                Analyze My Resume
              </>
            )}
          </button>
        </div>
      )}

      {/* Analysis Result */}
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
      {!hasResume && !analysis && (
        <div className="text-center py-16 bg-white border border-border rounded-2xl">
          <FileText className="w-16 h-16 text-foreground/20 mx-auto mb-4" />

          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            No Resume Yet
          </h3>

          <p className="text-foreground/60 max-w-sm mx-auto">
            Upload your resume as a PDF or TXT file to get
            detailed AI-powered feedback.
          </p>
        </div>
      )}
    </div>
  );
}