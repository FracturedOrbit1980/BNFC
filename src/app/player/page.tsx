import { PageHeader } from "@/components/layout/page-header";
import { PlayerHome } from "@/components/player/player-home";

export const metadata = { title: "Player" };

export default function PlayerPage() {
  return (
    <div>
      <PageHeader
        title="My game"
        description="Open your name once you are on a squad. Scores and the weekly report appear after a coach saves them."
      />
      <PlayerHome />
    </div>
  );
}
