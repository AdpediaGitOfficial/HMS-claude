import * as React from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Patient {
  id: string;
  name: string;
  mrn: string;
}
interface BirthRecord {
  id: string;
  babyName?: string;
  gender?: string;
  dateOfBirth: string;
  weightKg?: string;
}
interface DeathRecord {
  id: string;
  patientId: string;
  dateOfDeath: string;
  causeOfDeath: string;
}

export function BirthDeathPage() {
  const [births, setBirths] = React.useState<BirthRecord[]>([]);
  const [deaths, setDeaths] = React.useState<DeathRecord[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);

  const [babyName, setBabyName] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [weightKg, setWeightKg] = React.useState("");

  const [deathPatientId, setDeathPatientId] = React.useState("");
  const [dateOfDeath, setDateOfDeath] = React.useState("");
  const [causeOfDeath, setCauseOfDeath] = React.useState("");

  const load = React.useCallback(() => {
    Promise.all([
      api<BirthRecord[]>("/vital-records/births"),
      api<DeathRecord[]>("/vital-records/deaths"),
      api<Patient[]>("/patients"),
    ]).then(([b, d, p]) => {
      setBirths(b);
      setDeaths(d);
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

  async function onRegisterBirth(e: React.FormEvent) {
    e.preventDefault();
    await api("/vital-records/births", {
      method: "POST",
      body: JSON.stringify({ babyName, gender, dateOfBirth, weightKg: weightKg ? Number(weightKg) : undefined }),
    });
    setBabyName("");
    setGender("");
    setDateOfBirth("");
    setWeightKg("");
    load();
  }

  async function onRegisterDeath(e: React.FormEvent) {
    e.preventDefault();
    await api("/vital-records/deaths", {
      method: "POST",
      body: JSON.stringify({ patientId: deathPatientId, dateOfDeath, causeOfDeath }),
    });
    setDeathPatientId("");
    setDateOfDeath("");
    setCauseOfDeath("");
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onRegisterBirth} className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-4 text-[13.5px] font-bold">Register birth</h3>
          <div className="mb-3 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Baby name</label>
            <input
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <div className="mb-3 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Gender</label>
            <input
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <div className="mb-3 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Date of birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
            />
          </div>
          <Button type="submit" variant="primary">
            Register birth
          </Button>
        </form>

        <form onSubmit={onRegisterDeath} className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-4 text-[13.5px] font-bold">Register death</h3>
          <div className="mb-3 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Patient</label>
            <select
              value={deathPatientId}
              onChange={(e) => setDeathPatientId(e.target.value)}
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
          <div className="mb-3 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Date of death</label>
            <input
              type="date"
              value={dateOfDeath}
              onChange={(e) => setDateOfDeath(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Cause of death</label>
            <input
              value={causeOfDeath}
              onChange={(e) => setCauseOfDeath(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            />
          </div>
          <Button type="submit" variant="danger">
            Register death
          </Button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-[13.5px] font-bold">Birth register</h3>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left text-[11px] font-bold uppercase tracking-wide text-text-faint">
                  <th className="px-3 py-2">Baby</th>
                  <th className="px-3 py-2">DOB</th>
                  <th className="px-3 py-2">Weight</th>
                </tr>
              </thead>
              <tbody>
                {births.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-text-muted" colSpan={3}>
                      No records yet.
                    </td>
                  </tr>
                )}
                {births.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-semibold">{b.babyName ?? "—"} {b.gender && `(${b.gender})`}</td>
                    <td className="px-3 py-2 font-mono text-text-faint">{b.dateOfBirth}</td>
                    <td className="px-3 py-2 font-mono">{b.weightKg ? `${b.weightKg} kg` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-[13.5px] font-bold">Death register</h3>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left text-[11px] font-bold uppercase tracking-wide text-text-faint">
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Cause</th>
                </tr>
              </thead>
              <tbody>
                {deaths.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-text-muted" colSpan={3}>
                      No records yet.
                    </td>
                  </tr>
                )}
                {deaths.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-semibold">{patientLabel(d.patientId)}</td>
                    <td className="px-3 py-2 font-mono text-text-faint">{d.dateOfDeath}</td>
                    <td className="px-3 py-2">{d.causeOfDeath}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
