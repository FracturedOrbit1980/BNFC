import { RolePicker } from "@/components/auth/role-picker";
import { Badge } from "@/components/ui/badge";
import { CLUB_NAME } from "@/lib/demo/data";

export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const notice = typeof searchParams.notice === "string" ? searchParams.notice : undefined;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Benoni</p>
      <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-950">{CLUB_NAME}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-700">
        Grassroots through competitive youth. Plan on a desktop, run the session from the touchline.
      </p>
      {notice === "signin" ? (
        <p className="mt-4 rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
          Choose a demo role to open that area. This is not a live sign-in.
        </p>
      ) : null}
      <div className="mt-6 mb-4 flex items-center gap-2">
        <Badge className="bg-amber-400 text-slate-950">Demo only</Badge>
        <p className="text-sm font-medium text-slate-700">
          The role switcher sets a local cookie. It is not production authentication.
        </p>
      </div>
      <RolePicker />
    </div>
  );
}
