"use client";

/* Topbar identity — reads the signed-up profile (vb-profile) when present so
   a freemium user sees their own name, falling back to the demo org user. */

import { useEffect, useState } from "react";
import { currentUser } from "@/lib/data";
import { titleCase } from "@/lib/format";
import { getProfile, getPlan } from "@/lib/tab-mock";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).join("").slice(0, 2).toUpperCase() || "?";
}

export function TopbarUser() {
  const [user, setUser] = useState({ name: currentUser.full_name, role: titleCase(currentUser.role) });

  useEffect(() => {
    const sync = () => {
      const p = getProfile();
      if (p?.name) setUser({ name: p.name, role: getPlan() === "free" ? "Owner · Free trial" : "Owner" });
      else setUser({ name: currentUser.full_name, role: titleCase(currentUser.role) });
    };
    sync();
    window.addEventListener("vb-credits-change", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("vb-credits-change", sync); window.removeEventListener("storage", sync); };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-caramel to-mocha text-xs font-semibold text-cream">
        {initials(user.name)}
      </span>
      <span className="hidden text-left leading-tight sm:block">
        <span className="block text-xs font-semibold text-coffee">{user.name}</span>
        <span className="block text-[10px] text-muted-foreground">{user.role}</span>
      </span>
    </div>
  );
}
