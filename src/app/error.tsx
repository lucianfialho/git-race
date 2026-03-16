"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
          Error
        </span>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0a0a0a] mt-2">
          Something went wrong
        </h1>
        <p className="text-[#525252] text-sm mt-4 leading-relaxed">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="f1-btn f1-btn-primary rounded-sm text-sm mt-8"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
