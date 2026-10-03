export function PageHeader({
  title,
  description,
  className = "",
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <header className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
      <p className="mt-1 max-w-2xl text-base text-slate-700">{description}</p>
    </header>
  );
}
