import { Map } from "lucide-react";

export default function CareerRoadmap() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
          Career Roadmap
        </h1>
        <p className="text-foreground/60">
          Visualize your career journey with a personalized AI-generated roadmap.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Map className="w-8 h-8 text-rose-600" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          Career Roadmap — Coming Soon
        </h3>
        <p className="text-foreground/60 max-w-md mx-auto">
          See a clear, step-by-step roadmap to your dream career. Our AI maps
          out the skills, experiences, and milestones you need to reach your
          goals.
        </p>
      </div>
    </div>
  );
}