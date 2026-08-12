import { useAuth } from "@/context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <p className="text-sm text-text-muted">
        Welcome back, {user?.name}. This is a placeholder — the full dashboard from the mockup
        (KPI sparklines, queue, bed occupancy, blood bank, income/expense chart) gets built here next,
        wired to real data instead of the mockup's fixtures.
      </p>
    </div>
  );
}
