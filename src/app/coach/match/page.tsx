import { LiveMatchTracker } from "@/components/match/live-match-tracker";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Live match" };

export default function MatchPage() {
  return (
    <div>
      <PageHeader
        title="Live match"
        description="Run the clock from the squad you added, then save minutes to attendance."
      />
      <LiveMatchTracker />
    </div>
  );
}
