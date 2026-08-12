import * as React from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Encounter {
  id: string;
  patientId: string;
  department?: string;
  startedAt: string;
}
interface Patient {
  id: string;
  name: string;
  mrn: string;
}

export function OpdQueuePage() {
  const [encounters, setEncounters] = React.useState<Encounter[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      api<Encounter[]>("/encounters?type=opd&status=in_progress"),
      api<Patient[]>("/patients"),
    ])
      .then(([enc, pts]) => {
        setEncounters(enc);
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
        Patients currently checked in for OPD. Open a patient to chart vitals, diagnosis, and prescriptions.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
              <th className="px-3.5 py-2.5">Patient</th>
              <th className="px-3.5 py-2.5">Department</th>
              <th className="px-3.5 py-2.5">Checked in</th>
              <th className="px-3.5 py-2.5">Status</th>
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
            {!loading && encounters.length === 0 && (
              <tr>
                <td className="px-3.5 py-4 text-text-muted" colSpan={4}>
                  No one in the OPD queue right now.
                </td>
              </tr>
            )}
            {encounters.map((e) => {
              const p = patient(e.patientId);
              return (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-3.5 py-2.5">
                    <Link to={`/ehr/${e.id}`} className="font-semibold text-accent hover:text-accent-hover">
                      {p ? `${p.name} (${p.mrn})` : e.patientId}
                    </Link>
                  </td>
                  <td className="px-3.5 py-2.5 text-text-muted">{e.department ?? "—"}</td>
                  <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
                    {new Date(e.startedAt).toLocaleTimeString()}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Badge tone="info">Waiting</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
