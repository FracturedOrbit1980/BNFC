import { RosterBoard } from "@/components/coach/roster-board";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Roster" };

export default function RosterPage() {
  return (
    <div>
      <PageHeader
        title="U13 Premier"
        description="Pick a player, set the four scores, and leave homework they can read on their profile."
      />
      <RosterBoard />
    </div>
  );
}
