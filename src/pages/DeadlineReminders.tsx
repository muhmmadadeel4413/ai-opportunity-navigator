import { Bell } from "lucide-react";

export default function DeadlineReminders() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-2">
          Deadline Reminders
        </h1>
        <p className="text-foreground/60">
          Never miss an application deadline again. Get reminders for your
          saved opportunities.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          Deadline Reminders — Coming Soon
        </h3>
        <p className="text-foreground/60 max-w-md mx-auto">
          Set up custom reminders for application deadlines, interview dates,
          and follow-ups. Get notified via email or in-app so you never miss
          an opportunity.
        </p>
      </div>
    </div>
  );
}