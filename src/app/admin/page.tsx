import { ClubOverview } from "@/components/admin/club-overview";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Club admin" };

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        title="Club overview"
        description="Age groups, squads, and the official drill library. Player lists start empty."
      />
      <ClubOverview />
    </div>
  );
}
