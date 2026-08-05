import { OpportunityFinder } from "../components/OpportunityFinder";
import { Briefcase } from "lucide-react";

export default function InternshipFinder() {
  return (
    <OpportunityFinder
      type="internship"
      title="Internship Finder"
      description="Discover paid internship opportunities at top companies."
      icon={Briefcase}
      gradient="from-blue-500 to-cyan-500"
    />
  );
}