import Link from "next/link";

import { SessionPlanner } from "@/components/coach/session-planner";
import { TeamPicker } from "@/components/coach/team-picker";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Coach" };

export default function CoachPage() {
  return (
    <div>
      <PageHeader
        title="Your team"
        description="U12 already has the squad and shirt numbers. Tap an age group, then a division, to open a team."
      />
      <TeamPicker />
      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-11">
          <Link href="/coach/roster">Rate the squad</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-11">
          <Link href="/coach/editor">Drill editor and animator toolkit</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-11">
          <Link href="/coach/match">Live match</Link>
        </Button>
      </div>
      <SessionPlanner />
    </div>
  );
}
