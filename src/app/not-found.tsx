import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-[80px] font-black leading-none text-[#0a0a0a] tracking-tighter">
          404
        </span>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0a0a0a] mt-2">
          Page not found
        </h1>
        <p className="text-[#525252] text-sm mt-4 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="f1-btn f1-btn-primary rounded-sm text-sm mt-8 inline-flex">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
