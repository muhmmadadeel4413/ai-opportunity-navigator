import { Briefcase } from "lucide-react";

export default function ApplicationTracker() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
          Application Tracker
        </h1>
        <p className="text-foreground/60">
          Track all your job, internship, and scholarship applications in one
          place.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          Application Tracker — Coming Soon
        </h3>
        <p className="text-foreground/60 max-w-md mx-auto">
          Keep track of every application you submit. Monitor status updates,
          set interview reminders, and manage your entire job search pipeline
          from one dashboard.
        </p>
      </div>
    </div>
  );
}