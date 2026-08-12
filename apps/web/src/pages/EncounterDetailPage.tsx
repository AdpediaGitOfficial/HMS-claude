import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Encounter {
  id: string;
  patientId: string;
  type: "opd" | "ipd";
  status: "in_progress" | "completed" | "cancelled";
  department?: string;
  startedAt: string;
}
interface Patient {
  id: string;
  name: string;
  mrn: string;
  gender?: string;
  dateOfBirth?: string;
}
interface ClinicalNote {
  id: string;
  vitals: Record<string, string | number>;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  createdAt: string;
}

export function EncounterDetailPage() {
  const { encounterId } = useParams<{ encounterId: string }>();
  const navigate = useNavigate();

  const [encounter, setEncounter] = React.useState<Encounter | null>(null);
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [notes, setNotes] = React.useState<ClinicalNote[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [temp, setTemp] = React.useState("");
  const [bp, setBp] = React.useState("");
  const [pulse, setPulse] = React.useState("");
  const [diagnosis, setDiagnosis] = React.useState("");
  const [prescription, setPrescription] = React.useState("");
  const [freeNotes, setFreeNotes] = React.useState("");

  const load = React.useCallback(async () => {
    if (!encounterId) return;
    setLoading(true);
    const enc = await api<Encounter>(`/encounters/${encounterId}`);
    setEncounter(enc);
    const [pts, encNotes] = await Promise.all([
      api<Patient[]>("/patients"),
      api<ClinicalNote[]>(`/clinical-notes/by-encounter/${encounterId}`),
    ]);
    setPatient(pts.find((p) => p.id === enc.patientId) ?? null);
    setNotes(encNotes);
    setLoading(false);
  }, [encounterId]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!encounterId) return;
    const vitals: Record<string, string> = {};
    if (temp) vitals.temp = `${temp}°F`;
    if (bp) vitals.bp = bp;
    if (pulse) vitals.pulse = `${pulse} bpm`;

    await api("/clinical-notes", {
      method: "POST",
      body: JSON.stringify({ encounterId, vitals, diagnosis, prescription, notes: freeNotes }),
    });
    setTemp("");
    setBp("");
    setPulse("");
    setDiagnosis("");
    setPrescription("");
    setFreeNotes("");
    load();
  }

  async function onCloseEncounter() {
    if (!encounterId) return;
    await api(`/encounters/${encounterId}/close`, { method: "POST" });
    navigate(encounter?.type === "ipd" ? "/ipd" : "/opd");
  }

  if (loading || !encounter) return <p className="text-text-muted">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold">{patient?.name ?? "Unknown patient"}</h2>
            <Badge tone={encounter.type === "ipd" ? "critical" : "info"}>{encounter.type.toUpperCase()}</Badge>
            <Badge tone={encounter.status === "in_progress" ? "warning" : "neutral"}>
              {encounter.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="text-[12.5px] text-text-faint">
            {patient?.mrn} &middot; {encounter.department ?? "General"} &middot; started{" "}
            {new Date(encounter.startedAt).toLocaleString()}
          </div>
        </div>
        {encounter.status === "in_progress" && (
          <Button variant="danger" onClick={onCloseEncounter}>
            Close encounter
          </Button>
        )}
      </div>

      {encounter.status === "in_progress" && (
        <form onSubmit={onAddNote} className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-4 text-[13.5px] font-bold">Add clinical note</h3>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted">Temp (°F)</label>
              <input
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted">BP</label>
              <input
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80"
                className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-text-muted">Pulse (bpm)</label>
              <input
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
              />
            </div>
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Diagnosis</label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Prescription</label>
            <input
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Notes</label>
            <textarea
              value={freeNotes}
              onChange={(e) => setFreeNotes(e.target.value)}
              rows={3}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <Button type="submit" variant="primary">
            Save note
          </Button>
        </form>
      )}

      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Chart timeline</h3>
        <div className="flex flex-col gap-3">
          {notes.length === 0 && <p className="text-[13px] text-text-muted">No notes recorded yet.</p>}
          {notes.map((n) => (
            <div key={n.id} className="rounded-lg border border-border bg-surface p-4 shadow-card">
              <div className="mb-2 font-mono text-[11px] text-text-faint">{new Date(n.createdAt).toLocaleString()}</div>
              {Object.keys(n.vitals ?? {}).length > 0 && (
                <div className="mb-2 flex gap-4 font-mono text-[12.5px]">
                  {Object.entries(n.vitals).map(([k, v]) => (
                    <span key={k}>
                      <span className="text-text-faint">{k}:</span> {v}
                    </span>
                  ))}
                </div>
              )}
              {n.diagnosis && (
                <p className="text-[13px]">
                  <span className="font-semibold">Diagnosis:</span> {n.diagnosis}
                </p>
              )}
              {n.prescription && (
                <p className="text-[13px]">
                  <span className="font-semibold">Prescription:</span> {n.prescription}
                </p>
              )}
              {n.notes && <p className="mt-1 text-[13px] text-text-muted">{n.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
