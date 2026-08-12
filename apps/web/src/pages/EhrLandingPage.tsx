import * as React from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Encounter {
  id: string;
  patientId: string;
  type: "opd" | "ipd";
  department?: string;
  startedAt: string;
}
interface Patient {
  id: string;
  name: string;
  mrn: string;
}

export function EhrLandingPage() {
  const [encounters, setEncounters] = React.useState<Encounter[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([api<Encounter[]>("/encounters?status=in_progress"), api<Patient[]>("/patients")])
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
        Every open encounter — OPD and IPD — with charting still in progress. Pick one to add vitals, diagnosis, or
        a prescription.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-text-muted">Loading…</p>}
        {!loading && encounters.length === 0 && <p className="text-text-muted">No open encounters right now.</p>}
        {encounters.map((e) => {
          const p = patient(e.patientId);
          return (
            <Link
              key={e.id}
              to={`/ehr/${e.id}`}
              className="rounded-lg border border-border bg-surface p-4 shadow-card hover:border-accent"
            >
              <div className="mb-2 flex items-center justify-between">
                <Badge tone={e.type === "ipd" ? "critical" : "info"}>{e.type.toUpperCase()}</Badge>
                <span className="font-mono text-[11px] text-text-faint">
                  {new Date(e.startedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="font-semibold">{p ? p.name : e.patientId}</div>
              <div className="text-[12px] text-text-faint">{p?.mrn} &middot; {e.department ?? "General"}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
