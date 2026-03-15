import Link from "next/link";

export default async function SpecificRacePage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold text-white mb-2">Race {raceId}</h1>
        <p className="text-neutral-400 mb-6">
          Race details and timeline coming soon.
        </p>
        <Link
          href="/race"
          className="text-red-400 text-sm hover:underline"
        >
          Back to current race
        </Link>
      </div>
    </div>
  );
}
