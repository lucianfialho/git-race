"use client";

import dynamic from "next/dynamic";

const Hyperspeed = dynamic(() => import("./Hyperspeed"), {
  ssr: false,
});

interface HyperspeedWrapperProps {
  effectOptions?: Record<string, unknown>;
}

export default function HyperspeedWrapper({ effectOptions }: HyperspeedWrapperProps) {
  return <Hyperspeed effectOptions={effectOptions as never} />;
}
