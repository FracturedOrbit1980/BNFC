import { RosterBoard } from "@/components/coach/roster-board";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Roster" };

export default function RosterPage() {
  return (
    <div>
      <PageHeader
        title="Squad"
        description="Set the match day, mark who was at training, and save each player’s weekly report. Export, edit, and remove stay on this page."
      />
      <RosterBoard />
    </div>
  );
}
