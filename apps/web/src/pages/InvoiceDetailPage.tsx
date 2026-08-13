import * as React from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Invoice {
  id: string;
  patientId: string;
  encounterId: string;
  status: "draft" | "issued" | "partially_paid" | "paid" | "cancelled";
  totalAmount: string;
}
interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
}
interface Payment {
  id: string;
  amount: string;
  method: string;
  paidAt: string;
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

export function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [lines, setLines] = React.useState<InvoiceLine[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [patient, setPatient] = React.useState<Patient | null>(null);

  const [description, setDescription] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [unitPrice, setUnitPrice] = React.useState("");

  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("cash");

  const [insurer, setInsurer] = React.useState("");
  const [policy, setPolicy] = React.useState("");
  const [claimedAmount, setClaimedAmount] = React.useState("");
  const [claimSubmitted, setClaimSubmitted] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!invoiceId) return;
    const inv = await api<Invoice>(`/billing/invoices/${invoiceId}`);
    setInvoice(inv);
    const [ls, pts] = await Promise.all([
      api<InvoiceLine[]>(`/billing/invoices/${invoiceId}/lines`),
      api<Patient[]>("/patients"),
    ]);
    setLines(ls);
    setPatient(pts.find((p) => p.id === inv.patientId) ?? null);
    if (inv.status !== "draft") {
      setPayments(await api<Payment[]>(`/billing/invoices/${invoiceId}/payments`));
    }
  }, [invoiceId]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onAddLine(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceId) return;
    await api(`/billing/invoices/${invoiceId}/lines`, {
      method: "POST",
      body: JSON.stringify({ description, quantity: Number(quantity), unitPrice: Number(unitPrice) }),
    });
    setDescription("");
    setUnitPrice("");
    load();
  }

  async function onIssue() {
    if (!invoiceId) return;
    await api(`/billing/invoices/${invoiceId}/issue`, { method: "POST" });
    load();
  }

  async function onRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceId || !paymentAmount) return;
    await api(`/billing/invoices/${invoiceId}/payments`, {
      method: "POST",
      body: JSON.stringify({ amount: Number(paymentAmount), method: paymentMethod }),
    });
    setPaymentAmount("");
    load();
  }

  async function onSubmitClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceId || !invoice) return;
    await api("/billing/tpa-claims", {
      method: "POST",
      body: JSON.stringify({
        invoiceId,
        patientId: invoice.patientId,
        insurerName: insurer,
        policyNumber: policy,
        claimedAmount: Number(claimedAmount),
      }),
    });
    setClaimSubmitted(true);
  }

  if (!invoice) return <p className="text-text-muted">Loading…</p>;

  const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = Number(invoice.totalAmount) - paid;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold">{patient ? `${patient.name} (${patient.mrn})` : invoice.patientId}</h2>
            <Badge tone={STATUS_TONE[invoice.status]}>{invoice.status.replace("_", " ")}</Badge>
          </div>
          <div className="font-mono text-[13px] text-text-faint">Total &#8377;{Number(invoice.totalAmount).toFixed(2)}</div>
        </div>
        {invoice.status === "draft" && (
          <Button variant="primary" onClick={onIssue} disabled={lines.length === 0}>
            Issue invoice
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h3 className="mb-4 text-[13.5px] font-bold">Line items</h3>
        <table className="mb-4 w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[11px] font-bold uppercase tracking-wide text-text-faint">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 && (
              <tr>
                <td className="py-3 text-text-muted" colSpan={4}>
                  No line items yet.
                </td>
              </tr>
            )}
            {lines.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="py-2">{l.description}</td>
                <td className="py-2 text-right font-mono">{l.quantity}</td>
                <td className="py-2 text-right font-mono">&#8377;{Number(l.unitPrice).toFixed(2)}</td>
                <td className="py-2 text-right font-mono">&#8377;{Number(l.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {invoice.status === "draft" && (
          <form onSubmit={onAddLine} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Consultation fee"
                className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted">Qty</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted">Unit price (&#8377;)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-28 rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
                required
              />
            </div>
            <Button type="submit" variant="secondary">
              Add line
            </Button>
          </form>
        )}
      </div>

      {invoice.status !== "draft" && (
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-4 text-[13.5px] font-bold">Payments</h3>
          <div className="mb-4 flex gap-6 font-mono text-[13px]">
            <span>
              <span className="text-text-faint">Paid:</span> &#8377;{paid.toFixed(2)}
            </span>
            <span>
              <span className="text-text-faint">Balance:</span> &#8377;{balance.toFixed(2)}
            </span>
          </div>
          <div className="mb-4 flex flex-col gap-2">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between rounded-sm bg-surface-2 px-3 py-2 text-[13px]">
                <span className="capitalize">{p.method}</span>
                <span className="font-mono">&#8377;{Number(p.amount).toFixed(2)}</span>
                <span className="font-mono text-text-faint">{new Date(p.paidAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          {balance > 0 && (
            <form onSubmit={onRecordPayment} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-muted">Amount (&#8377;)</label>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-28 rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-muted">Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>
              <Button type="submit" variant="primary">
                Record payment
              </Button>
            </form>
          )}
        </div>
      )}

      {invoice.status !== "draft" && !claimSubmitted && (
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-4 text-[13.5px] font-bold">Submit insurance / TPA claim</h3>
          <form onSubmit={onSubmitClaim} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted">Insurer</label>
              <input
                value={insurer}
                onChange={(e) => setInsurer(e.target.value)}
                className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted">Policy number</label>
              <input
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
                className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted">Claimed amount (&#8377;)</label>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(e.target.value)}
                className="w-32 rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
                required
              />
            </div>
            <Button type="submit" variant="secondary">
              Submit claim
            </Button>
          </form>
        </div>
      )}
      {claimSubmitted && (
        <p className="text-[13px] text-success">Claim submitted — track it from the Insurance / TPA Claims page.</p>
      )}
    </div>
  );
}
