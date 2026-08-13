import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface BloodUnit {
  id: string;
  bloodType: string;
  status: "available" | "reserved" | "issued" | "expired";
  collectedAt: string;
  expiresAt: string;
}
interface Patient {
  id: string;
  name: string;
  mrn: string;
}

function tileTone(count: number) {
  if (count === 0) return "border-critical bg-critical-soft text-critical";
  if (count < 5) return "border-warning bg-warning-soft text-warning";
  return "border-border bg-surface text-text";
}

function IssueRow({ unit, patients, onIssued }: { unit: BloodUnit; patients: Patient[]; onIssued: () => void }) {
  const [patientId, setPatientId] = React.useState("");

  async function onIssue() {
    if (!patientId) return;
    await api(`/blood-bank/${unit.id}/issue`, { method: "POST", body: JSON.stringify({ patientId }) });
    onIssued();
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3.5 py-2.5 font-bold">{unit.bloodType}</td>
      <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
        {new Date(unit.expiresAt).toLocaleDateString()}
      </td>
      <td className="px-3.5 py-2.5">
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="rounded-sm border border-border-strong bg-surface px-2 py-1.5 text-[12.5px]"
        >
          <option value="">Select patient…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.mrn})
            </option>
          ))}
        </select>
      </td>
      <td className="px-3.5 py-2.5 text-right">
        <Button variant="secondary" onClick={onIssue} disabled={!patientId}>
          Issue
        </Button>
      </td>
    </tr>
  );
}

export function BloodBankPage() {
  const [summary, setSummary] = React.useState<Record<string, number>>({});
  const [units, setUnits] = React.useState<BloodUnit[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [bloodType, setBloodType] = React.useState("O+");

  const load = React.useCallback(() => {
    Promise.all([
      api<Record<string, number>>("/blood-bank/summary"),
      api<BloodUnit[]>("/blood-bank"),
      api<Patient[]>("/patients"),
    ]).then(([s, u, p]) => {
      setSummary(s);
      setUnits(u);
      setPatients(p);
    });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onAddUnit(e: React.FormEvent) {
    e.preventDefault();
    await api("/blood-bank", { method: "POST", body: JSON.stringify({ bloodType }) });
    load();
  }

  const available = units.filter((u) => u.status === "available");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Inventory</h3>
        <div className="grid grid-cols-4 gap-3">
          {BLOOD_TYPES.map((bt) => {
            const count = summary[bt] ?? 0;
            return (
              <div key={bt} className={cn("flex flex-col items-center gap-1 rounded-lg border p-4", tileTone(count))}>
                <span className="text-[13px] font-bold">{bt}</span>
                <span className="font-mono text-[22px] font-bold">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={onAddUnit} className="flex items-end gap-3 rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-muted">Blood type</label>
          <select
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
          >
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="primary">
          Add unit
        </Button>
      </form>

      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Available units</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">Type</th>
                <th className="px-3.5 py-2.5">Expires</th>
                <th className="px-3.5 py-2.5">Issue to</th>
                <th className="px-3.5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {available.length === 0 && (
                <tr>
                  <td className="px-3.5 py-4 text-text-muted" colSpan={4}>
                    No units available.
                  </td>
                </tr>
              )}
              {available.map((u) => (
                <IssueRow key={u.id} unit={u} patients={patients} onIssued={load} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
