import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface TpaClaim {
  id: string;
  patientId: string;
  insurerName: string;
  policyNumber: string;
  claimedAmount: string;
  approvedAmount?: string | null;
  status: "submitted" | "approved" | "rejected" | "settled";
  submittedAt: string;
}
interface Patient {
  id: string;
  name: string;
  mrn: string;
}

const STATUS_TONE: Record<TpaClaim["status"], "warning" | "success" | "critical" | "neutral"> = {
  submitted: "warning",
  approved: "success",
  rejected: "critical",
  settled: "neutral",
};

function ClaimRow({ claim, patient, onUpdated }: { claim: TpaClaim; patient?: Patient; onUpdated: () => void }) {
  const [approvedAmount, setApprovedAmount] = React.useState(claim.claimedAmount);

  async function update(status: "approved" | "rejected" | "settled") {
    await api(`/billing/tpa-claims/${claim.id}/status`, {
      method: "POST",
      body: JSON.stringify(status === "approved" ? { status, approvedAmount: Number(approvedAmount) } : { status }),
    });
    onUpdated();
  }

  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-2">
      <td className="px-3.5 py-2.5 font-semibold">{patient ? `${patient.name} (${patient.mrn})` : claim.patientId}</td>
      <td className="px-3.5 py-2.5">{claim.insurerName}</td>
      <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">{claim.policyNumber}</td>
      <td className="px-3.5 py-2.5 text-right font-mono">&#8377;{Number(claim.claimedAmount).toFixed(2)}</td>
      <td className="px-3.5 py-2.5">
        <Badge tone={STATUS_TONE[claim.status]}>{claim.status}</Badge>
      </td>
      <td className="px-3.5 py-2.5 text-right">
        {claim.status === "submitted" && (
          <div className="flex items-center justify-end gap-2">
            <input
              type="number"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              className="w-24 rounded-sm border border-border-strong bg-surface px-2 py-1 text-[12px] font-mono"
            />
            <Button variant="secondary" onClick={() => update("approved")}>
              Approve
            </Button>
            <Button variant="danger" onClick={() => update("rejected")}>
              Reject
            </Button>
          </div>
        )}
        {claim.status === "approved" && (
          <Button variant="secondary" onClick={() => update("settled")}>
            Mark settled
          </Button>
        )}
      </td>
    </tr>
  );
}

export function InsuranceClaimsPage() {
  const [claims, setClaims] = React.useState<TpaClaim[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);

  const load = React.useCallback(() => {
    Promise.all([api<TpaClaim[]>("/billing/tpa-claims"), api<Patient[]>("/patients")]).then(([c, p]) => {
      setClaims(c);
      setPatients(p);
    });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
      <table className="w-full text-[13.5px]">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
            <th className="px-3.5 py-2.5">Patient</th>
            <th className="px-3.5 py-2.5">Insurer</th>
            <th className="px-3.5 py-2.5">Policy</th>
            <th className="px-3.5 py-2.5 text-right">Claimed</th>
            <th className="px-3.5 py-2.5">Status</th>
            <th className="px-3.5 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {claims.length === 0 && (
            <tr>
              <td className="px-3.5 py-4 text-text-muted" colSpan={6}>
                No claims submitted yet.
              </td>
            </tr>
          )}
          {claims.map((c) => (
            <ClaimRow key={c.id} claim={c} patient={patients.find((p) => p.id === c.patientId)} onUpdated={load} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
