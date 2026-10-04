import { RolePicker } from "@/components/auth/role-picker";
import { CLUB_NAME } from "@/lib/club/catalog";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Benoni</p>
      <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-950">{CLUB_NAME}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-700">
        Register players, allocate them to an age group and league, then coach that team. Drills and the attendance register follow the allocation.
      </p>
      <div className="mt-6">
        <RolePicker />
      </div>
    </div>
  );
}
