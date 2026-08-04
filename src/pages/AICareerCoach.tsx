import { Bot } from "lucide-react";

export default function AICareerCoach() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
          AI Career Coach
        </h1>
        <p className="text-foreground/60">
          Get personalized career advice, interview tips, and guidance from your
          AI career coach.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          AI Career Coach — Coming Soon
        </h3>
        <p className="text-foreground/60 max-w-md mx-auto">
          Chat with an AI career coach that knows your profile, skills, and goals.
          Get personalized advice on which opportunities to pursue, how to prepare
          for interviews, and how to grow your career.
        </p>
      </div>
    </div>
  );
}