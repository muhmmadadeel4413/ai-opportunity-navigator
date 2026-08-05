import { OpportunityFinder } from "../components/OpportunityFinder";
import { Award } from "lucide-react";

export default function FellowshipFinder() {
  return (
    <OpportunityFinder
      type="fellowship"
      title="Fellowship Programs"
      description="Explore prestigious fellowship programs with mentorship and stipends."
      icon={Award}
      gradient="from-teal-500 to-emerald-500"
    />
  );
}