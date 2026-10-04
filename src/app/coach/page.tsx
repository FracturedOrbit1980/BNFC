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
        description="The imported players are on U12 Prem. Open that team to edit a name, shirt number, date of birth, or position."
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
