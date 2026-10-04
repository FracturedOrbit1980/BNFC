import { DrillLibrary } from "@/components/drills/drill-library";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Drills" };

export default function CoachDrillsPage() {
  return (
    <div>
      <PageHeader
        title="Session drills"
        description="Search by level, open a saved drill from its image, and attach a short video. Then set the block time and run the stopwatch."
      />
      <DrillLibrary />
    </div>
  );
}
