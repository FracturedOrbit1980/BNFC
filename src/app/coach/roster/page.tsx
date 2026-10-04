import { RosterBoard } from "@/components/coach/roster-board";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Roster" };

export default function RosterPage() {
  return (
    <div>
      <PageHeader
        title="Squad"
        description="The squad is a short list. Tap a player to open their rating, details, and training week."
      />
      <RosterBoard />
    </div>
  );
}
