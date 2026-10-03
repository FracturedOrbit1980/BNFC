import { PeopleBoard } from "@/components/admin/people-board";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "People" };

export default function PeoplePage() {
  return (
    <div>
      <PageHeader
        title="Coaches and players"
        description="Every age group, the coach assigned to each team, and the players in that squad."
      />
      <PeopleBoard />
    </div>
  );
}
