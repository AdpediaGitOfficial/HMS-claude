import * as React from "react";
import { api } from "@/lib/api";

interface Summary {
  totalPatients: number;
  todaysAppointments: number;
  activeAdmissions: number;
  revenueThisMonth: string;
  lowStockCount: number;
  pendingLabResults: number;
}
interface AuditEntry {
  id: string;
  actorId: string;
  method: string;
  path: string;
  statusCode: number;
  createdAt: string;
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <p className="mb-1 text-[11.3px] font-semibold text-text-faint">{label}</p>
      <p className="font-mono text-[22px] font-bold">{value}</p>
    </div>
  );
}

export function ReportsPage() {
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [auditLog, setAuditLog] = React.useState<AuditEntry[]>([]);

  React.useEffect(() => {
    api<Summary>("/reports/summary").then(setSummary);
    api<AuditEntry[]>("/reports/audit-log").then(setAuditLog);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total patients" value={summary?.totalPatients ?? "—"} />
        <StatCard label="Today's appointments" value={summary?.todaysAppointments ?? "—"} />
        <StatCard label="Active admissions" value={summary?.activeAdmissions ?? "—"} />
        <StatCard label="Revenue this month" value={summary ? `₹${Number(summary.revenueThisMonth).toFixed(0)}` : "—"} />
        <StatCard label="Low stock items" value={summary?.lowStockCount ?? "—"} />
        <StatCard label="Pending lab results" value={summary?.pendingLabResults ?? "—"} />
      </div>

      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Audit log</h3>
        <p className="mb-3 text-[12.5px] text-text-muted">
          Every write across every module — logged automatically by the request pipeline (§11), not by each module
          remembering to log itself.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[12.8px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">When</th>
                <th className="px-3.5 py-2.5">Method</th>
                <th className="px-3.5 py-2.5">Path</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5">Actor</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.length === 0 && (
                <tr>
                  <td className="px-3.5 py-4 text-text-muted" colSpan={5}>
                    No mutating requests recorded yet.
                  </td>
                </tr>
              )}
              {auditLog.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-3.5 py-2 font-mono text-text-faint">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="px-3.5 py-2 font-mono font-bold">{a.method}</td>
                  <td className="px-3.5 py-2 font-mono">{a.path}</td>
                  <td className="px-3.5 py-2 font-mono">{a.statusCode}</td>
                  <td className="px-3.5 py-2 font-mono text-text-faint">{a.actorId.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
