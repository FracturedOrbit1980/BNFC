import { DrillLibrary } from "@/components/drills/drill-library";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Drills" };

export default function CoachDrillsPage() {
  return (
    <div>
      <PageHeader
        title="Session drills"
        description="Set your own block time, check the small setup diagram, then start the stopwatch."
      />
      <DrillLibrary />
    </div>
  );
}
