import * as React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Invoice {
  id: string;
  patientId: string;
  status: "draft" | "issued" | "partially_paid" | "paid" | "cancelled";
  totalAmount: string;
  createdAt: string;
}
interface Patient {
  id: string;
  name: string;
  mrn: string;
}

const STATUS_TONE: Record<Invoice["status"], "neutral" | "success" | "warning" | "critical" | "info"> = {
  draft: "neutral",
  issued: "info",
  partially_paid: "warning",
  paid: "success",
  cancelled: "critical",
};

export function BillingPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([api<Invoice[]>("/billing/invoices"), api<Patient[]>("/patients")])
      .then(([inv, pts]) => {
        setInvoices(inv);
        setPatients(pts);
      })
      .finally(() => setLoading(false));
  }, []);

  function patient(id: string) {
    return patients.find((p) => p.id === id);
  }

  return (
    <div>
      <p className="mb-4 text-[13px] text-text-muted">
        Invoices are generated from an encounter (see the "Generate invoice" action on an EHR chart). Add line
        items, issue, and record payments from here.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
              <th className="px-3.5 py-2.5">Patient</th>
              <th className="px-3.5 py-2.5">Created</th>
              <th className="px-3.5 py-2.5">Status</th>
              <th className="px-3.5 py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={4}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && invoices.length === 0 && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={4}>
                  No invoices yet.
                </td>
              </tr>
            )}
            {invoices.map((inv) => {
              const p = patient(inv.patientId);
              return (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-3.5 py-2.5">
                    <Link to={`/billing/${inv.id}`} className="font-semibold text-accent hover:text-accent-hover">
                      {p ? `${p.name} (${p.mrn})` : inv.patientId}
                    </Link>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Badge tone={STATUS_TONE[inv.status]}>{inv.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono">&#8377;{Number(inv.totalAmount).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
