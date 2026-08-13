import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Patient {
  id: string;
  name: string;
  mrn: string;
}
interface Referral {
  id: string;
  patientId: string;
  externalDoctorName?: string;
  externalClinicName?: string;
  reason: string;
  status: "pending" | "accepted" | "completed";
  referredAt: string;
}

const STATUS_TONE: Record<Referral["status"], "warning" | "info" | "success"> = {
  pending: "warning",
  accepted: "info",
  completed: "success",
};

export function ReferralPage() {
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [patientId, setPatientId] = React.useState("");
  const [externalDoctorName, setExternalDoctorName] = React.useState("");
  const [externalClinicName, setExternalClinicName] = React.useState("");
  const [reason, setReason] = React.useState("");

  const load = React.useCallback(() => {
    Promise.all([api<Referral[]>("/referrals"), api<Patient[]>("/patients")]).then(([r, p]) => {
      setReferrals(r);
      setPatients(p);
    });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function patientLabel(id: string) {
    const p = patients.find((x) => x.id === id);
    return p ? `${p.name} (${p.mrn})` : id;
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await api("/referrals", {
      method: "POST",
      body: JSON.stringify({ patientId, externalDoctorName, externalClinicName, reason }),
    });
    setExternalDoctorName("");
    setExternalClinicName("");
    setReason("");
    load();
  }

  async function onUpdateStatus(id: string, status: "accepted" | "completed") {
    await api(`/referrals/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onCreate} className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h3 className="mb-4 text-[13.5px] font-bold">Refer a patient</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <label className="text-[12px] font-semibold text-text-muted">External doctor</label>
            <input
              value={externalDoctorName}
              onChange={(e) => setExternalDoctorName(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">External clinic</label>
            <input
              value={externalClinicName}
              onChange={(e) => setExternalClinicName(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Reason</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            />
          </div>
        </div>
        <Button type="submit" variant="primary" className="mt-4">
          Submit referral
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
              <th className="px-3.5 py-2.5">Patient</th>
              <th className="px-3.5 py-2.5">Referred to</th>
              <th className="px-3.5 py-2.5">Reason</th>
              <th className="px-3.5 py-2.5">Status</th>
              <th className="px-3.5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={5}>
                  No referrals yet.
                </td>
              </tr>
            )}
            {referrals.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-3.5 py-2.5 font-semibold">{patientLabel(r.patientId)}</td>
                <td className="px-3.5 py-2.5 text-text-muted">
                  {r.externalDoctorName ?? "—"} {r.externalClinicName ? `(${r.externalClinicName})` : ""}
                </td>
                <td className="px-3.5 py-2.5">{r.reason}</td>
                <td className="px-3.5 py-2.5">
                  <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                </td>
                <td className="px-3.5 py-2.5 text-right">
                  {r.status === "pending" && (
                    <Button variant="secondary" onClick={() => onUpdateStatus(r.id, "accepted")}>
                      Accept
                    </Button>
                  )}
                  {r.status === "accepted" && (
                    <Button variant="secondary" onClick={() => onUpdateStatus(r.id, "completed")}>
                      Complete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
