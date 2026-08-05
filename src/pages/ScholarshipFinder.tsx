import { OpportunityFinder } from "../components/OpportunityFinder";
import { GraduationCap } from "lucide-react";

export default function ScholarshipFinder() {
  return (
    <OpportunityFinder
      type="scholarship"
      title="Scholarship Finder"
      description="Find scholarships and grants to fund your education."
      icon={GraduationCap}
      gradient="from-green-500 to-emerald-500"
    />
  );
}