/* v5 shell — shared by /dashboard-v6 and its sub-routes (e.g. /today).
   Fixed overlay so it replaces the global v2 shell. Edits here only touch v5. */

import { V6Sidebar } from "@/components/v6/sidebar";
import { V6Topbar } from "@/components/v6/topbar";

export default function V6Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex bg-background"
      style={{
        backgroundImage:
          "radial-gradient(1100px 560px at 80% -10%, #f9ead2 0%, transparent 58%), radial-gradient(820px 460px at 2% 102%, #f1e3d2 0%, transparent 60%)",
      }}
    >
      <V6Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <V6Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-7 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
