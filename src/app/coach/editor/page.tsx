import { DrillEditor } from "@/components/drills/drill-editor";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Drill editor" };

export default function DrillEditorPage() {
  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <PageHeader
        className="editor-title"
        title="Drill editor and animator toolkit"
        description="Name the drill, set the pitch, then record the animation. Saving keeps the layout with that drill."
      />
      <DrillEditor />
    </div>
  );
}
