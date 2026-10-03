import { PageHeader } from "@/components/layout/page-header";
import { PlayerHome } from "@/components/player/player-home";

export const metadata = { title: "Player" };

export default function PlayerPage() {
  return (
    <div>
      <PageHeader
        title="My game"
        description="Your profile, latest scores, homework, and attendance. Ratings update when your coach saves them."
      />
      <PlayerHome />
    </div>
  );
}
