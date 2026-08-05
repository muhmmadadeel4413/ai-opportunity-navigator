import { OpportunityFinder } from "../components/OpportunityFinder";
import { Zap } from "lucide-react";

export default function HackathonFinder() {
  return (
    <OpportunityFinder
      type="hackathon"
      title="Hackathon Finder"
      description="Find coding competitions and build amazing projects."
      icon={Zap}
      gradient="from-purple-500 to-pink-500"
    />
  );
}