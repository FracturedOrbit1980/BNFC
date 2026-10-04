import { PeopleBoard } from "@/components/admin/people-board";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "People" };

export default function PeoplePage() {
  return (
    <div>
      <PageHeader
        title="Register and allocate"
        description="Register players first. Then put each one on a team and league. Positions stay editable, and a player can move to another team."
      />
      <PeopleBoard />
    </div>
  );
}
