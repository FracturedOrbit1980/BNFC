import { RosterBoard } from "@/components/coach/roster-board";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Roster" };

export default function RosterPage() {
  return (
    <div>
      <PageHeader
        title="Squad"
        description="Add players to the team you chose, then export, edit, or remove them. Ratings and homework stay on this page."
      />
      <RosterBoard />
    </div>
  );
}
