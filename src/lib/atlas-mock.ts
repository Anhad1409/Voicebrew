// Mock data for the v4 "Atlas — Live Operations" console.
// Self-contained: nothing here is imported by v2. Safe to evolve freely.

export type AgentStatus = "on-call" | "idle" | "wrapping";
export type FleetAgent = {
  id: string;
  name: string;
  persona: string;
  lang: string;
  status: AgentStatus;
  campaign: string;
  handled: number;
  baseSeconds: number; // seconds into the current call (ticks up live for on-call)
};

export const fleet: FleetAgent[] = [
  { id: "a1", name: "Anjali", persona: "Empathetic closer", lang: "Hinglish", status: "on-call", campaign: "EMI Reminders", handled: 84, baseSeconds: 142 },
  { id: "a2", name: "Misha", persona: "Crisp & factual", lang: "Hindi", status: "on-call", campaign: "Outreach", handled: 71, baseSeconds: 58 },
  { id: "a3", name: "Priya", persona: "Warm guide", lang: "Tamil", status: "wrapping", campaign: "Policy Renewal", handled: 63, baseSeconds: 11 },
  { id: "a4", name: "Kabir", persona: "Patient negotiator", lang: "Punjabi", status: "on-call", campaign: "IOB Activation", handled: 52, baseSeconds: 207 },
  { id: "a5", name: "Riya", persona: "Playful & quick", lang: "Hinglish", status: "idle", campaign: "—", handled: 39, baseSeconds: 0 },
  { id: "a6", name: "Arjun", persona: "Calm authority", lang: "Telugu", status: "idle", campaign: "—", handled: 28, baseSeconds: 0 },
];

// Lead temperature pipeline (cool → hot). Counts are "today". Café-toned.
export const heat = [
  { band: "Cold", count: 63, color: "#9AA8A0", desc: "Not yet engaged" },
  { band: "Warm", count: 34, color: "#C99A5B", desc: "Showing interest" },
  { band: "Hot", count: 11, color: "#C2410C", desc: "Ready to convert" },
];

// AI co-pilot "right now" — the next best actions, rotated in the hero.
export type NextAction = { tone: "amber" | "teal" | "plum"; label: string; detail: string; cta: string; href: string };
export const nextActions: NextAction[] = [
  { tone: "teal", label: "2 leads waiting for a human", detail: "Outreach handoffs are queued — pick them up before they cool.", cta: "Open queue", href: "/handoff" },
  { tone: "amber", label: "Wallet runway: ~2h 10m", detail: "At the current burn you'll run dry mid-afternoon. Top up to keep the line live.", cta: "Top up", href: "/settings/billing" },
  { tone: "plum", label: "EMI Reminders is your best roast", detail: "Connect rate 68% — 7 pts above average. Consider shifting idle channels here.", cta: "Rebalance", href: "/campaigns" },
  { tone: "teal", label: "5 callbacks due in the next hour", detail: "Promised windows are closing. Confirm the agent will reach them in time.", cta: "Review", href: "/leads" },
];

// Live wire — event templates streamed into the feed.
export type FeedKind = "connected" | "hot" | "handoff" | "callback" | "converted" | "voicemail" | "dnc";
export const feedKinds: FeedKind[] = ["connected", "hot", "connected", "callback", "converted", "handoff", "voicemail", "connected", "hot", "dnc"];
export const feedKindMeta: Record<FeedKind, { label: string; color: string }> = {
  connected: { label: "Connected", color: "#6E8157" },
  hot: { label: "Turned hot", color: "#C2410C" },
  handoff: { label: "Handoff", color: "#BE823F" },
  callback: { label: "Callback set", color: "#C99A5B" },
  converted: { label: "Converted", color: "#4F7A4A" },
  voicemail: { label: "Voicemail", color: "#A2917D" },
  dnc: { label: "Do-not-call", color: "#A14A3A" },
};
export const feedNames = ["Rajesh K.", "Priya S.", "Aarav M.", "Sneha R.", "Vikram T.", "Neha G.", "Imran S.", "Divya P.", "Karthik V.", "Ananya B.", "Rohan D.", "Meera J."];
export const feedCampaigns = ["EMI Reminders", "Outreach", "IOB Activation", "Policy Renewal"];

// Pipeline / provider health for the operator status bar.
export const providers = [
  { name: "Telephony", detail: "Pjsip", latency: 42 },
  { name: "STT · Deepgram", detail: "Nova-3", latency: 88 },
  { name: "LLM · Gemini", detail: "2.5 Flash", latency: 210 },
  { name: "TTS · Cartesia", detail: "Sonic-3", latency: 130 },
];

// 24-point intraday sparkline for "calls in flight" (believable rhythm).
export const flightSeries = [4, 5, 6, 5, 7, 8, 7, 9, 8, 7, 9, 10, 9, 8, 9, 7, 8, 9, 8, 6, 7, 8, 7, 6];

// "Today's roast" — calls per hour across the working day (for the area chart).
export const roastCurve = [
  { h: "9a", v: 18 }, { h: "10a", v: 34 }, { h: "11a", v: 52 }, { h: "12p", v: 61 },
  { h: "1p", v: 44 }, { h: "2p", v: 58 }, { h: "3p", v: 72 }, { h: "4p", v: 66 },
  { h: "5p", v: 54 }, { h: "6p", v: 48 }, { h: "7p", v: 31 }, { h: "8p", v: 19 },
];
export const roastNowIndex = 6; // "3p" — live marker

// Conversion funnel (today). Café-toned, light → deep roast.
export const funnel = [
  { label: "Dialed", value: 312, color: "#CBB89C" },
  { label: "Connected", value: 190, color: "#C99A5B" },
  { label: "Interested", value: 78, color: "#BE823F" },
  { label: "Hot", value: 11, color: "#C2410C" },
];

// Live call player — rotating "on the line now" conversations with typed transcripts.
export type CallTurn = { who: "agent" | "lead"; text: string };
export type LiveCall = { agent: string; lead: string; campaign: string; lang: string; sentiment: number; transcript: CallTurn[] };
export const liveCalls: LiveCall[] = [
  {
    agent: "Anjali", lead: "Rajesh Kumar", campaign: "EMI Reminders", lang: "Hinglish", sentiment: 0.76,
    transcript: [
      { who: "agent", text: "Hi Rajesh, this is Anjali from VoiceBrew about your EMI due this week." },
      { who: "lead", text: "Haan bolo, kitna pending hai?" },
      { who: "agent", text: "₹4,200 is due on the 5th. I can set up auto-pay so you never miss it — shall I?" },
      { who: "lead", text: "Theek hai, set kar do." },
      { who: "agent", text: "Done! A confirmation SMS is on its way. Anything else I can help with?" },
    ],
  },
  {
    agent: "Misha", lead: "Aarav Mehta", campaign: "Outreach", lang: "English", sentiment: 0.84,
    transcript: [
      { who: "agent", text: "Hi Aarav, Misha here — quick one about the offer you were looking at." },
      { who: "lead", text: "Yeah, I was curious about the interest rate." },
      { who: "agent", text: "For your profile it's 10.5%, and I can lock it in today. Want me to?" },
      { who: "lead", text: "Sure, let's do it." },
    ],
  },
  {
    agent: "Kabir", lead: "Sneha Reddy", campaign: "IOB Activation", lang: "Hindi", sentiment: 0.62,
    transcript: [
      { who: "agent", text: "Namaste Sneha ji, main Kabir — mobile banking activation ke liye call kiya hai." },
      { who: "lead", text: "Haan, par process thoda samajh nahi aaya." },
      { who: "agent", text: "Koi baat nahi, main step-by-step bata deta hoon. Pehle app install kijiye…" },
      { who: "lead", text: "Ok, install ho gaya." },
    ],
  },
];
