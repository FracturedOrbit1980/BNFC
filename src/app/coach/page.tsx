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
        description="Choose a team after the club admin creates the age group and squad. Then plan the session."
      />
      <TeamPicker />
      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-11">
          <Link href="/coach/roster">Rate the squad</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-11">
          <Link href="/coach/match">Live match</Link>
        </Button>
      </div>
      <SessionPlanner />
    </div>
  );
}
