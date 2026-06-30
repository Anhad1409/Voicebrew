"use client";

import { Coffee } from "lucide-react";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import { CHANNELS, CAPACITY, HEALTHY_CEILING, baselineActive } from "@/lib/channel-mock";
import { cn } from "@/lib/utils";

// Live capacity readout for the top bar — 1 channel = 1 call.
export function CapacityChip() {
  const active = useLiveCapacity(baselineActive);
  const level = active / CAPACITY;
  const tone =
    level >= 1 ? "border-danger/30 bg-danger/10 text-danger"
    : level >= HEALTHY_CEILING ? "border-warning/30 bg-warning/10 text-warning"
    : "border-success/30 bg-success/10 text-success";

  return (
    <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5", tone)} title="Live channel capacity — 1 channel = 1 call">
      <Coffee className="size-3.5" />
      <span className="text-sm font-semibold tabular-nums">{active}/{CHANNELS}</span>
      <span className="text-[11px] opacity-70">channels live</span>
    </div>
  );
}
