import { LiveMatchTracker } from "@/components/match/live-match-tracker";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Live match" };

export default function MatchPage() {
  return (
    <div>
      <PageHeader
        title="Live match"
        description="Demo clock and substitution board. Minutes are kept in the browser until a match log is saved."
      />
      <LiveMatchTracker />
    </div>
  );
}
