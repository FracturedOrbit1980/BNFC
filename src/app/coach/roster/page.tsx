import { RosterBoard } from "@/components/coach/roster-board";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Roster" };

export default function RosterPage() {
  return (
    <div>
      <PageHeader
        title="Squad"
        description="Set the match day, mark who was at training, and save each player’s weekly report. Upload a list of players and shirt numbers, or export, edit, and remove."
      />
      <RosterBoard />
    </div>
  );
}
