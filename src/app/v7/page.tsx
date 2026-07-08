"use client";

/* /v7 — preview hub for the re-brewed list pages. The live routes are
   untouched; each card opens the v7 take for side-by-side comparison. */

import Link from "next/link";
import { ArrowRight, Megaphone, Users, Phone, FileBarChart } from "lucide-react";
import { V7Banner, monoLabel } from "@/components/v7/kit";

const PAGES = [
  { href: "/v7/campaigns", live: "/campaigns", icon: Megaphone, name: "Campaigns", desc: "The menu board — chip filters, pour-progress bars, live equalizers." },
  { href: "/v7/leads", live: "/leads", icon: Users, name: "Leads", desc: "Cups on the counter — temperature bands, warmth meters, latte-art avatars." },
  { href: "/v7/calls", live: "/calls", icon: Phone, name: "Calls", desc: "The pour log — colored outcome chips, warmth deltas, expandable dossiers." },
  { href: "/v7/reports", live: "/reports", icon: FileBarChart, name: "Reports", desc: "The ledger shelf — icon tiles, category chips, 7-day sparks." },
];

export default function V7Index() {
  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="Version seven · preview"
        title="List pages, re-brewed"
        subtitle="The dashboard's language, applied to every page with a list on it. Live routes are untouched — compare side by side."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PAGES.map((p) => (
          <Link key={p.href} href={p.href}
            className="group flex items-start gap-4 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glass-hover">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-oat text-caramel transition-transform group-hover:scale-105">
              <p.icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-serif text-lg font-semibold text-coffee">
                {p.name} <ArrowRight className="size-4 text-latte transition-transform group-hover:translate-x-1 group-hover:text-caramel" />
              </span>
              <span className="mt-0.5 block text-sm text-mocha">{p.desc}</span>
              <span className={`${monoLabel} mt-2 block`}>current: {p.live}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
