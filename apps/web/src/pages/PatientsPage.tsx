import * as React from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Patient {
  id: string;
  mrn: string;
  name: string;
  gender?: string;
  phone?: string;
  createdAt: string;
}

/**
 * The list-view pattern from §10: search/filter bar (stubbed for now) +
 * data table + "+ New". Every other module's list screen (Inventory,
 * Staff, Invoices) is this same shape with different columns.
 */
export function PatientsPage() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    api<Patient[]>("/patients")
      .then(setPatients)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onNewPatient() {
    const name = window.prompt("Patient name?");
    if (!name) return;
    await api("/patients", { method: "POST", body: JSON.stringify({ name }) });
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Patients</h2>
        <Button variant="primary" onClick={onNewPatient}>
          + New patient
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
              <th className="px-3.5 py-2.5">MRN</th>
              <th className="px-3.5 py-2.5">Name</th>
              <th className="px-3.5 py-2.5">Gender</th>
              <th className="px-3.5 py-2.5">Phone</th>
              <th className="px-3.5 py-2.5">Registered</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-3.5 py-4 text-critical" colSpan={5}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && patients.length === 0 && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={5}>
                  No patients registered yet.
                </td>
              </tr>
            )}
            {patients.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">{p.mrn}</td>
                <td className="px-3.5 py-2.5 font-semibold">{p.name}</td>
                <td className="px-3.5 py-2.5 text-text-muted">{p.gender ?? "—"}</td>
                <td className="px-3.5 py-2.5 text-text-muted">{p.phone ?? "—"}</td>
                <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
