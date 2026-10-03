import { DrillLibrary } from "@/components/drills/drill-library";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Drills" };

export default function CoachDrillsPage() {
  return (
    <div>
      <PageHeader
        title="Session drills"
        description="Set the block time, lay out the drill on the pitch, then run the stopwatch."
      />
      <DrillLibrary />
    </div>
  );
}
