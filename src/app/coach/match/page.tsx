import { LiveMatchTracker } from "@/components/match/live-match-tracker";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Live match" };

export default function MatchPage() {
  return (
    <div>
      <PageHeader
        className="match-title [@media(orientation:landscape)_and_(max-height:520px)]:mb-1 [@media(orientation:landscape)_and_(max-height:520px)]:[&_p]:hidden"
        title="Live match"
        description="Pick a formation, start the clock, and substitute from the bench. Minutes count only for players on the pitch."
      />
      <LiveMatchTracker />
    </div>
  );
}
