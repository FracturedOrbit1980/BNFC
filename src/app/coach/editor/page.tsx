import { DrillEditor } from "@/components/drills/drill-editor";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Drill editor" };

export default function DrillEditorPage() {
  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <PageHeader
        className="editor-title"
        title="Drill editor and animator toolkit"
        description="The tools sit to the left of the pitch. Point at an icon for a short description, and turn descriptions on or off at the bottom."
      />
      <DrillEditor />
    </div>
  );
}
