import { cn } from "@/lib/utils";

/**
 * VoiceBrew brand mark — a coffee cup with a voice waveform inside,
 * steam wisps and a sparkle. Inherits `currentColor`; scales cleanly.
 * Recreated as inline SVG from the official VoiceBrew logo.
 */
export function VoiceBrewMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} role="img" aria-label="VoiceBrew">
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* steam */}
        <path d="M11 3.5c-1.6 1.7-1.6 3.3 0 5" />
        <path d="M15.5 2c-1.6 1.9-1.6 3.5 0 5.4" />
        {/* cup body */}
        <rect x="5" y="13" width="22" height="20" rx="5.5" />
        {/* handle */}
        <path d="M27 18.5h3.2a4.4 4.4 0 0 1 0 8.8H27" />
        {/* voice waveform */}
        <path d="M10.5 28v-6.5" />
        <path d="M14.5 30.5v-12" />
        <path d="M18.5 28v-8" />
        <path d="M22 27v-5" />
      </g>
      {/* sparkle */}
      <path d="M24.4 15.2l.75 1.85 1.85.75-1.85.75-.75 1.85-.75-1.85L21.8 18.55l1.85-.75z" fill="currentColor" />
    </svg>
  );
}

/** Full lockup: mark + "VoiceBrew" wordmark + "by Blostem". */
export function VoiceBrewLogo({ className, sub = true }: { className?: string; sub?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <VoiceBrewMark className="size-8 shrink-0 text-coffee" />
      <span className="leading-tight">
        <span className="block font-serif text-lg font-semibold text-coffee">
          Voice<span className="text-caramel">Brew</span>
        </span>
        {sub && <span className="block text-[9px] font-medium uppercase tracking-[0.16em] text-latte">by Blostem</span>}
      </span>
    </span>
  );
}
