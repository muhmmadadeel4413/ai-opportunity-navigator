import { OpportunityFinder } from "../components/OpportunityFinder";
import { Target } from "lucide-react";

export default function JobFinder() {
  return (
    <OpportunityFinder
      type="job"
      title="Job Opportunity Finder"
      description="Find full-time job opportunities at leading companies."
      icon={Target}
      gradient="from-rose-500 to-red-500"
    />
  );
}