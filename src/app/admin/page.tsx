import { ClubOverview } from "@/components/admin/club-overview";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Club admin" };

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        title="Club overview"
        description="U13 down to U6 are ready. Choose a division to open a team in that age group."
      />
      <ClubOverview />
    </div>
  );
}
