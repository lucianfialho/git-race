import Link from "next/link";

export default async function SpecificRacePage({ params }: { params: Promise<{ raceId: string }> }) {
  const { raceId } = await params;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="font-bold text-xl text-[#0a0a0a] mb-2">Race {raceId}</h1>
        <p className="text-[#525252] mb-6">Race details coming soon.</p>
        <Link href="/race" className="text-[#e10600] text-sm font-semibold hover:underline">Back to current race</Link>
      </div>
    </div>
  );
}
