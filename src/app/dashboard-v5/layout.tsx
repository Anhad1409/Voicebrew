/* v5 shell — shared by /dashboard-v5 and its sub-routes (e.g. /today).
   Fixed overlay so it replaces the global v2 shell. Edits here only touch v5. */

import { V5Sidebar } from "@/components/v5/sidebar";
import { V5Topbar } from "@/components/v5/topbar";

export default function V5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex bg-background"
      style={{
        backgroundImage:
          "radial-gradient(1100px 560px at 80% -10%, #f9ead2 0%, transparent 58%), radial-gradient(820px 460px at 2% 102%, #f1e3d2 0%, transparent 60%)",
      }}
    >
      <V5Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <V5Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-7 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
