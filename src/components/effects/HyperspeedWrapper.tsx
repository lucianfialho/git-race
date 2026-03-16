"use client";

import dynamic from "next/dynamic";
import { hyperspeedPresets } from "@/components/HyperSpeedPresets";

const Hyperspeed = dynamic(() => import("@/components/Hyperspeed"), {
  ssr: false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const F1_PRESET = hyperspeedPresets.two as any;

export default function HyperspeedWrapper() {
  return <Hyperspeed effectOptions={F1_PRESET} />;
}
