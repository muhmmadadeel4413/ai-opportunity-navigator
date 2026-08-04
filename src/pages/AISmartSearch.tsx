import { Search } from "lucide-react";

export default function AISmartSearch() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
          AI Smart Search
        </h1>
        <p className="text-foreground/60">
          Use natural language to find opportunities that match what you're
          looking for.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          Smart Search — Coming Soon
        </h3>
        <p className="text-foreground/60 max-w-md mx-auto">
          Describe what you're looking for in your own words and our AI will find
          the best opportunities for you. Try "remote internships in machine
          learning" or "scholarships for women in tech".
        </p>
      </div>
    </div>
  );
}