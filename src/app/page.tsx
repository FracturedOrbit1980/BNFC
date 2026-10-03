import { RolePicker } from "@/components/auth/role-picker";
import { CLUB_NAME } from "@/lib/club/catalog";

export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const notice = typeof searchParams.notice === "string" ? searchParams.notice : undefined;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Benoni</p>
      <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-950">{CLUB_NAME}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-700">
        The club drill library is ready. Squads, ratings, and attendance stay empty until you add them.
      </p>
      {notice === "signin" ? (
        <p className="mt-4 rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-950">
          Choose your area to continue.
        </p>
      ) : null}
      <div className="mt-6">
        <RolePicker />
      </div>
    </div>
  );
}
