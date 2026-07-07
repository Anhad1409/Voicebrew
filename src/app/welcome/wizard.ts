// OPEN A TAB wizard — chip data, greetings, grant timeline. Spec §3–4.

export const ROLES = ["Founder", "Ops / Collections lead", "Developer", "Marketing", "Other"];
export const TEAM = ["Just me", "2–10", "11–50", "51+"];
export const USE_CASES = ["EMI reminders", "Collections", "KYC verification", "Loan onboarding", "Lead qualification", "Something else"];
export const VERTICALS = ["NBFC", "Bank", "Fintech", "Insurance", "Edtech", "Healthcare", "Other"];
export const LANGS = ["Hinglish", "Hindi", "English", "Tamil", "Telugu", "Marathi", "Bengali"];
export const VOLUMES = ["Just exploring", "<1k", "1k–10k", "10k–100k", "100k+"];

// THE ORDER — what they'll use the tool for + campaigns they'll run (multi-select)
export const GOALS = ["Collect payments on time", "Verify customers (KYC)", "Win new customers", "Remind & notify", "Support callbacks", "Run surveys"];
export const CAMPAIGN_KINDS = ["Payment reminders", "Collections follow-ups", "KYC / verification", "Lead qualification", "Promotional offers", "Surveys & feedback", "Missed-call callbacks"];
export const PROMO_KINDS = new Set(["Lead qualification", "Promotional offers"]);

// FIELDS V2 (ONBOARDING-FIELDS-V2.md) — 7 evidence-backed additions
export const SETUPS = ["Tele-caller team", "Auto-dialer / IVR", "Another AI voice tool", "WhatsApp & SMS only", "Not calling yet"];
export const DIRECTIONS = ["Outbound campaigns", "Inbound answering", "Both ways"];
export const DLT_STATUS = ["DLT-registered already", "Registration in progress", "DLT? Tell me more"];
export const TIMELINES = ["This week", "This month", "This quarter", "Just tasting"];
export const PERSONAS = ["Warm & friendly (Hindi-first)", "Polite & formal (English)", "Firm but fair (collections)", "Upbeat seller (Hinglish)", "Surprise me"];
export const WINDOWS = ["Mornings (9–12)", "Afternoons (12–4)", "Evenings (4–8)", "You pick — keep me TRAI-safe"];
export const CRMS = ["LeadSquared", "Zoho", "Salesforce", "HubSpot", "Excel / Sheets", "Our own LMS-LOS", "Nowhere yet"];

// promotional → 140-series · service/transactional → 160-series (silent routing)
export const PATH_OF: Record<string, "promo" | "service"> = {
  "EMI reminders": "service", Collections: "service", "KYC verification": "service",
  "Loan onboarding": "service", "Lead qualification": "promo", "Something else": "promo",
};

export const GREETINGS: Record<string, string> = {
  Hinglish: "Namaste! Aapki EMI kal due hai — main madad ke liye yahan hoon.",
  Hindi: "नमस्ते! आपकी EMI कल देय है — मैं मदद के लिए यहाँ हूँ।",
  English: "Hello! Your EMI is due tomorrow — I'm here to help.",
  Tamil: "Vanakkam! Ungal EMI naalai due aagum.",
  Telugu: "Namaskaram! Mee EMI repu due undi.",
  Marathi: "Namaskar! Tumchi EMI udya due aahe.",
  Bengali: "Nomoshkar! Apnar EMI kal due ache.",
};

export const STEP_LABELS = ["NAME ON THE TAB", "PICK YOUR BLEND", "THE ORDER", "CHOOSE THE ROAST", "TRAIN YOUR BARISTA", "THE FIRST POUR"];

export const GRANT = { SCROLL: 0, STAMP: 400, POUR: 900, SUB: 2600, WIPE: 3400, SKIP_AFTER: 300 } as const;

export type RLine = { label: string; value: string; tone?: "milk" | "free" | "verified" };

export const readback = (p: { name?: string; useCase?: string; languages?: string[]; vertical?: string }) => [
  `Namaste ${p.name?.split(" ")[0] || "ji"}! Aapka order taiyaar hai — ${(p.useCase || "voice campaigns").toLowerCase()}, ${p.languages?.[0] || "Hinglish"} mein, aapke ${p.vertical || "business"} ke liye.`,
  "Yeh raha aapka pehla pour — bilkul on the house.",
  "Jab aap taiyaar hon, dashboard se apna pehla campaign brew kijiye. Milte hain!",
];
