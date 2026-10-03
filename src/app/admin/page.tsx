import { ClubOverview } from "@/components/admin/club-overview";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Club admin" };

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        title="Club overview"
        description="Age groups and teams start empty. Create them here. The drill library is already included."
      />
      <ClubOverview />
    </div>
  );
}
