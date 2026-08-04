import { FileText } from "lucide-react";

export default function ResumeAnalysis() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
          Resume Analysis
        </h1>
        <p className="text-foreground/60">
          Upload your resume and get AI-powered feedback to make it stand out.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          Resume Analysis — Coming Soon
        </h3>
        <p className="text-foreground/60 max-w-md mx-auto">
          Get instant AI feedback on your resume. See what's missing, what
          could be improved, and how to tailor it for specific opportunities
          you're targeting.
        </p>
      </div>
    </div>
  );
}