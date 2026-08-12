import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Patient {
  id: string;
  name: string;
  mrn: string;
}
interface StaffUser {
  id: string;
  name: string;
}
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  department?: string;
  scheduledAt: string;
  status: string;
}

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "critical" | "info"> = {
  booked: "warning",
  confirmed: "success",
  checked_in: "info",
  completed: "neutral",
  cancelled: "critical",
  no_show: "critical",
};

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffUser[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [patientId, setPatientId] = React.useState("");
  const [doctorId, setDoctorId] = React.useState("");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [department, setDepartment] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      api<Appointment[]>("/appointments"),
      api<Patient[]>("/patients"),
      api<StaffUser[]>("/users"),
    ])
      .then(([appts, pts, users]) => {
        setAppointments(appts);
        setPatients(pts);
        setDoctors(users);
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !doctorId || !scheduledAt) return;
    await api("/appointments", {
      method: "POST",
      body: JSON.stringify({ patientId, doctorId, scheduledAt: new Date(scheduledAt).toISOString(), department }),
    });
    setPatientId("");
    setDoctorId("");
    setScheduledAt("");
    setDepartment("");
    load();
  }

  async function onCheckIn(id: string) {
    const encounter = await api<{ id: string }>(`/appointments/${id}/check-in`, { method: "POST" });
    load();
    navigate(`/ehr/${encounter.id}`);
  }

  function patientLabel(id: string) {
    const p = patients.find((x) => x.id === id);
    return p ? `${p.name} (${p.mrn})` : id;
  }
  function doctorLabel(id: string) {
    return doctors.find((x) => x.id === id)?.name ?? id;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="mb-4 text-[14px] font-bold">Book appointment</h2>
        <form onSubmit={onCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Patient</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            >
              <option value="">Select…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mrn})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            >
              <option value="">Select…</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Cardiology"
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Date &amp; time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" className="w-full">
              Book
            </Button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
              <th className="px-3.5 py-2.5">Patient</th>
              <th className="px-3.5 py-2.5">Doctor</th>
              <th className="px-3.5 py-2.5">Department</th>
              <th className="px-3.5 py-2.5">When</th>
              <th className="px-3.5 py-2.5">Status</th>
              <th className="px-3.5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && appointments.length === 0 && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={6}>
                  No appointments booked yet.
                </td>
              </tr>
            )}
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-3.5 py-2.5 font-semibold">{patientLabel(a.patientId)}</td>
                <td className="px-3.5 py-2.5 text-text-muted">{doctorLabel(a.doctorId)}</td>
                <td className="px-3.5 py-2.5 text-text-muted">{a.department ?? "—"}</td>
                <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
                  {new Date(a.scheduledAt).toLocaleString()}
                </td>
                <td className="px-3.5 py-2.5">
                  <Badge tone={STATUS_TONE[a.status] ?? "neutral"}>{a.status.replace("_", " ")}</Badge>
                </td>
                <td className="px-3.5 py-2.5 text-right">
                  {a.status === "booked" || a.status === "confirmed" ? (
                    <Button variant="secondary" onClick={() => onCheckIn(a.id)}>
                      Check in
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
