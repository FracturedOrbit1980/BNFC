import { PeopleBoard } from "@/components/admin/people-board";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "People" };

export default function PeoplePage() {
  return (
    <div>
      <PageHeader
        title="Coaches and players"
        description="Assign coaches and add players. No squad list is loaded for you."
      />
      <PeopleBoard />
    </div>
  );
}
