import * as React from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { AddPatientModal, type Patient } from "@/components/patients/AddPatientModal";

/** Same computation the Add Patient form uses — age is always derived from dateOfBirth, never stored, so a patient registered a year ago still shows a correct age today. */
function formatAge(dobStr?: string | null): string {
  if (!dobStr) return "—";
  const dob = new Date(`${dobStr}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return "—";
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "—";
  return `${years}y ${months}m ${days}d`;
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
  const [modalMode, setModalMode] = React.useState<"closed" | "create" | Patient>("closed");

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

  function onSaved() {
    setModalMode("closed");
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Patients</h2>
        <Button variant="primary" onClick={() => setModalMode("create")}>
          + New patient
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
              <th className="px-3.5 py-2.5">MRN</th>
              <th className="px-3.5 py-2.5">Name</th>
              <th className="px-3.5 py-2.5">Age</th>
              <th className="px-3.5 py-2.5">Gender</th>
              <th className="px-3.5 py-2.5">Phone</th>
              <th className="px-3.5 py-2.5">Guardian</th>
              <th className="px-3.5 py-2.5">Registered</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={7}>
                  Loading…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-3.5 py-4 text-critical" colSpan={7}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && patients.length === 0 && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={7}>
                  No patients registered yet.
                </td>
              </tr>
            )}
            {patients.map((p) => (
              <tr
                key={p.id}
                onClick={() => setModalMode(p)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
              >
                <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">{p.mrn}</td>
                <td className="px-3.5 py-2.5 font-semibold">{p.name}</td>
                <td className="px-3.5 py-2.5 text-text-muted">{formatAge(p.dateOfBirth)}</td>
                <td className="px-3.5 py-2.5 text-text-muted">{p.gender ?? "—"}</td>
                <td className="px-3.5 py-2.5 text-text-muted">{p.phone ?? "—"}</td>
                <td className="px-3.5 py-2.5 text-text-muted">{p.guardianName ?? "—"}</td>
                <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalMode !== "closed" && (
        <AddPatientModal
          patient={modalMode === "create" ? undefined : modalMode}
          onClose={() => setModalMode("closed")}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
