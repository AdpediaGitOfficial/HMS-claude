import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "@/context/AuthContext";

export function AppShell({ title, crumb }: { title: string; crumb: string }) {
  const { user } = useAuth();
  const role = user?.roles?.[0] ?? "admin";

  return (
    <div className="flex min-h-screen bg-surface-2">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col bg-surface-2">
        <div className="bg-surface">
          <Topbar title={title} crumb={crumb} />
        </div>
        <main className="flex-1 overflow-x-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
