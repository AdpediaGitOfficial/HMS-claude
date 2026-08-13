import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface StaffUser {
  id: string;
  name: string;
  email: string;
}
interface EmployeeDetail {
  id: string;
  userId: string;
  designation: string;
  department?: string;
  monthlySalary: string;
}
interface Attendance {
  id: string;
  userId: string;
  status: string;
}
interface PayrollRun {
  id: string;
  periodMonth: number;
  periodYear: number;
  status: "draft" | "processed";
}

const ATTENDANCE_TONE: Record<string, "success" | "critical" | "warning" | "neutral"> = {
  present: "success",
  absent: "critical",
  leave: "warning",
  half_day: "warning",
};

export function HrPage() {
  const [users, setUsers] = React.useState<StaffUser[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeDetail[]>([]);
  const [attendance, setAttendance] = React.useState<Attendance[]>([]);
  const [runs, setRuns] = React.useState<PayrollRun[]>([]);

  const [userId, setUserId] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [dateOfJoining, setDateOfJoining] = React.useState("");
  const [monthlySalary, setMonthlySalary] = React.useState("");

  const load = React.useCallback(() => {
    Promise.all([
      api<StaffUser[]>("/users"),
      api<EmployeeDetail[]>("/hr/employees"),
      api<Attendance[]>("/hr/attendance"),
      api<PayrollRun[]>("/hr/payroll/runs"),
    ]).then(([u, e, a, r]) => {
      setUsers(u);
      setEmployees(e);
      setAttendance(a);
      setRuns(r);
    });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function userName(id: string) {
    return users.find((u) => u.id === id)?.name ?? id;
  }

  async function onAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    await api("/hr/employees", {
      method: "POST",
      body: JSON.stringify({ userId, designation, dateOfJoining, monthlySalary: Number(monthlySalary) }),
    });
    setDesignation("");
    setDateOfJoining("");
    setMonthlySalary("");
    load();
  }

  async function markAttendance(uid: string, status: string) {
    await api("/hr/attendance", { method: "POST", body: JSON.stringify({ userId: uid, status }) });
    load();
  }

  async function onCreateRun() {
    const now = new Date();
    await api("/hr/payroll/runs", {
      method: "POST",
      body: JSON.stringify({ periodMonth: now.getMonth() + 1, periodYear: now.getFullYear() }),
    });
    load();
  }

  async function onProcessRun(id: string) {
    await api(`/hr/payroll/runs/${id}/process`, { method: "POST" });
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Today's attendance</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">Staff</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 text-right">Mark</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const today = attendance.find((a) => a.userId === u.id);
                return (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                    <td className="px-3.5 py-2.5 font-semibold">{u.name}</td>
                    <td className="px-3.5 py-2.5">
                      {today ? (
                        <Badge tone={ATTENDANCE_TONE[today.status]}>{today.status.replace("_", " ")}</Badge>
                      ) : (
                        <Badge tone="neutral">Not marked</Badge>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => markAttendance(u.id, "present")}>
                          Present
                        </Button>
                        <Button variant="secondary" onClick={() => markAttendance(u.id, "absent")}>
                          Absent
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h3 className="mb-4 text-[13.5px] font-bold">Add employee record</h3>
        <form onSubmit={onAddEmployee} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Staff</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            >
              <option value="">Select…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Designation</label>
            <input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Date of joining</label>
            <input
              type="date"
              value={dateOfJoining}
              onChange={(e) => setDateOfJoining(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Monthly salary (&#8377;)</label>
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
              required
            />
          </div>
          <div>
            <Button type="submit" variant="primary">
              Add
            </Button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Staff directory</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">Staff</th>
                <th className="px-3.5 py-2.5">Designation</th>
                <th className="px-3.5 py-2.5 text-right">Monthly salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-3.5 py-2.5 font-semibold">{userName(e.userId)}</td>
                  <td className="px-3.5 py-2.5">{e.designation}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono">&#8377;{Number(e.monthlySalary).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13.5px] font-bold">Payroll runs</h3>
          <Button variant="secondary" onClick={onCreateRun}>
            New run (this month)
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">Period</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 text-right" />
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td className="px-3.5 py-4 text-text-muted" colSpan={3}>
                    No payroll runs yet.
                  </td>
                </tr>
              )}
              {runs.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-3.5 py-2.5 font-mono">
                    {r.periodMonth}/{r.periodYear}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Badge tone={r.status === "processed" ? "success" : "neutral"}>{r.status}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    {r.status === "draft" && (
                      <Button variant="secondary" onClick={() => onProcessRun(r.id)}>
                        Process
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
