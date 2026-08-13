import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  driverName: string;
  status: "available" | "on_trip" | "maintenance";
}
interface Trip {
  id: string;
  ambulanceId: string;
  pickupLocation: string;
  dropLocation: string;
  dispatchedAt: string;
  status: "dispatched" | "completed" | "cancelled";
}

const VEHICLE_TONE: Record<Vehicle["status"], "success" | "warning" | "neutral"> = {
  available: "success",
  on_trip: "warning",
  maintenance: "neutral",
};

export function AmbulancePage() {
  const [fleet, setFleet] = React.useState<Vehicle[]>([]);
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [vehicleNumber, setVehicleNumber] = React.useState("");
  const [driverName, setDriverName] = React.useState("");
  const [ambulanceId, setAmbulanceId] = React.useState("");
  const [pickup, setPickup] = React.useState("");
  const [drop, setDrop] = React.useState("");

  const load = React.useCallback(() => {
    Promise.all([api<Vehicle[]>("/ambulance/fleet"), api<Trip[]>("/ambulance/trips")]).then(([f, t]) => {
      setFleet(f);
      setTrips(t);
    });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    await api("/ambulance/fleet", { method: "POST", body: JSON.stringify({ vehicleNumber, driverName }) });
    setVehicleNumber("");
    setDriverName("");
    load();
  }

  async function onDispatch(e: React.FormEvent) {
    e.preventDefault();
    await api("/ambulance/trips", {
      method: "POST",
      body: JSON.stringify({ ambulanceId, pickupLocation: pickup, dropLocation: drop }),
    });
    setAmbulanceId("");
    setPickup("");
    setDrop("");
    load();
  }

  async function onComplete(tripId: string) {
    await api(`/ambulance/trips/${tripId}/complete`, { method: "POST" });
    load();
  }

  const available = fleet.filter((v) => v.status === "available");

  function vehicleLabel(id: string) {
    return fleet.find((v) => v.id === id)?.vehicleNumber ?? id;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Fleet</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fleet.map((v) => (
            <div key={v.id} className="rounded-lg border border-border bg-surface p-4 shadow-card">
              <div className="font-bold">{v.vehicleNumber}</div>
              <div className="mb-2 text-[12px] text-text-faint">{v.driverName}</div>
              <Badge tone={VEHICLE_TONE[v.status]}>{v.status.replace("_", " ")}</Badge>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onAddVehicle} className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-muted">Vehicle number</label>
          <input
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-muted">Driver</label>
          <input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            required
          />
        </div>
        <Button type="submit" variant="primary">
          Add vehicle
        </Button>
      </form>

      <form onSubmit={onDispatch} className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-muted">Vehicle</label>
          <select
            value={ambulanceId}
            onChange={(e) => setAmbulanceId(e.target.value)}
            className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            required
          >
            <option value="">Select…</option>
            {available.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicleNumber}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-muted">Pickup</label>
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-text-muted">Drop</label>
          <input
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
            className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            required
          />
        </div>
        <Button type="submit" variant="primary" disabled={available.length === 0}>
          Dispatch
        </Button>
      </form>

      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Trips</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">Vehicle</th>
                <th className="px-3.5 py-2.5">Route</th>
                <th className="px-3.5 py-2.5">Dispatched</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 && (
                <tr>
                  <td className="px-3.5 py-4 text-text-muted" colSpan={5}>
                    No trips yet.
                  </td>
                </tr>
              )}
              {trips.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-3.5 py-2.5 font-semibold">{vehicleLabel(t.ambulanceId)}</td>
                  <td className="px-3.5 py-2.5 text-text-muted">
                    {t.pickupLocation} &rarr; {t.dropLocation}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
                    {new Date(t.dispatchedAt).toLocaleString()}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <Badge tone={t.status === "dispatched" ? "warning" : "success"}>{t.status}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    {t.status === "dispatched" && (
                      <Button variant="secondary" onClick={() => onComplete(t.id)}>
                        Mark complete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
