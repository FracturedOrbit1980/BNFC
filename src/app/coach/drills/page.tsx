import { DrillLibrary } from "@/components/drills/drill-library";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Drills" };

export default function CoachDrillsPage() {
  return (
    <div>
      <PageHeader
        title="Session drills"
        description="Filter by the moment of the game and the drill type. Names follow type, focus, player setup, and constraint."
      />
      <DrillLibrary />
    </div>
  );
}
