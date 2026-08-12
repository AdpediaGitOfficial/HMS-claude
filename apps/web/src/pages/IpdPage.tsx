import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Ward {
  id: string;
  name: string;
}
interface Bed {
  id: string;
  wardId: string;
  label: string;
  status: "available" | "occupied" | "maintenance";
}
interface Patient {
  id: string;
  name: string;
  mrn: string;
}
interface Admission {
  id: string;
  patientId: string;
  bedId: string;
  encounterId: string;
  admittedAt: string;
  status: "admitted" | "discharged";
}

const BED_TONE: Record<Bed["status"], string> = {
  available: "border-border bg-surface text-text-muted",
  occupied: "border-critical bg-critical-soft text-critical",
  maintenance: "border-warning bg-warning-soft text-warning",
};

export function IpdPage() {
  const navigate = useNavigate();
  const [wards, setWards] = React.useState<Ward[]>([]);
  const [beds, setBeds] = React.useState<Bed[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [admissions, setAdmissions] = React.useState<Admission[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [patientId, setPatientId] = React.useState("");
  const [bedId, setBedId] = React.useState("");
  const [department, setDepartment] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      api<Ward[]>("/beds/wards"),
      api<Bed[]>("/beds"),
      api<Patient[]>("/patients"),
      api<Admission[]>("/admissions"),
    ])
      .then(([w, b, p, a]) => {
        setWards(w);
        setBeds(b);
        setPatients(p);
        setAdmissions(a);
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onAdmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !bedId) return;
    const admission = await api<Admission>("/admissions", {
      method: "POST",
      body: JSON.stringify({ patientId, bedId, department }),
    });
    setPatientId("");
    setBedId("");
    setDepartment("");
    load();
    navigate(`/ehr/${admission.encounterId}`);
  }

  async function onDischarge(admissionId: string) {
    const summary = window.prompt("Discharge summary (optional)") ?? undefined;
    await api(`/admissions/${admissionId}/discharge`, {
      method: "POST",
      body: JSON.stringify({ dischargeSummary: summary }),
    });
    load();
  }

  const availableBeds = beds.filter((b) => b.status === "available");
  const activeAdmissions = admissions.filter((a) => a.status === "admitted");

  function patientName(id: string) {
    return patients.find((p) => p.id === id)?.name ?? id;
  }
  function bedLabel(id: string) {
    return beds.find((b) => b.id === id)?.label ?? id;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Bed board</h3>
        {loading && <p className="text-text-muted">Loading…</p>}
        <div className="flex flex-col gap-4">
          {wards.map((ward) => (
            <div key={ward.id} className="rounded-lg border border-border bg-surface p-4 shadow-card">
              <div className="mb-3 text-[12.5px] font-bold text-text-muted">{ward.name}</div>
              <div className="flex flex-wrap gap-2">
                {beds
                  .filter((b) => b.wardId === ward.id)
                  .map((b) => (
                    <div
                      key={b.id}
                      className={cn(
                        "flex h-14 w-16 flex-col items-center justify-center rounded-md border text-[11.5px] font-bold",
                        BED_TONE[b.status],
                      )}
                      title={b.status}
                    >
                      {b.label}
                      <span className="text-[9.5px] font-semibold uppercase opacity-75">{b.status}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onAdmit} className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h3 className="mb-4 text-[13.5px] font-bold">Admit patient</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
            <label className="text-[12px] font-semibold text-text-muted">Bed</label>
            <select
              value={bedId}
              onChange={(e) => setBedId(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            >
              <option value="">Select…</option>
              {availableBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" className="w-full" disabled={availableBeds.length === 0}>
              Admit
            </Button>
          </div>
        </div>
      </form>

      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Current admissions</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">Patient</th>
                <th className="px-3.5 py-2.5">Bed</th>
                <th className="px-3.5 py-2.5">Admitted</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {activeAdmissions.length === 0 && (
                <tr>
                  <td className="px-3.5 py-4 text-text-muted" colSpan={5}>
                    No patients currently admitted.
                  </td>
                </tr>
              )}
              {activeAdmissions.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-3.5 py-2.5 font-semibold">{patientName(a.patientId)}</td>
                  <td className="px-3.5 py-2.5 font-mono">{bedLabel(a.bedId)}</td>
                  <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
                    {new Date(a.admittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Badge tone="critical">Admitted</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <Button variant="secondary" onClick={() => onDischarge(a.id)}>
                      Discharge
                    </Button>
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
