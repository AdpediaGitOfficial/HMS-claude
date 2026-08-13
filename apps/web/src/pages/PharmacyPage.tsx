import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface StockItem {
  id: string;
  name: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
}
interface Order {
  id: string;
  encounterId: string;
  status: string;
  orderedAt: string;
}

function DispenseRow({ order, stock, onDispensed }: { order: Order; stock: StockItem[]; onDispensed: () => void }) {
  const [stockItemId, setStockItemId] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [error, setError] = React.useState<string | null>(null);

  async function onDispense() {
    setError(null);
    try {
      await api("/pharmacy/dispense", {
        method: "POST",
        body: JSON.stringify({ orderId: order.id, stockItemId, quantity: Number(quantity) }),
      });
      onDispensed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to dispense");
    }
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">{order.id.slice(0, 8)}</td>
      <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
        {new Date(order.orderedAt).toLocaleString()}
      </td>
      <td className="px-3.5 py-2.5">
        <select
          value={stockItemId}
          onChange={(e) => setStockItemId(e.target.value)}
          className="rounded-sm border border-border-strong bg-surface px-2 py-1.5 text-[12.5px]"
        >
          <option value="">Select medicine…</option>
          {stock.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.quantityOnHand} {s.unit})
            </option>
          ))}
        </select>
      </td>
      <td className="px-3.5 py-2.5">
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-16 rounded-sm border border-border-strong bg-surface px-2 py-1.5 text-[12.5px] font-mono"
        />
      </td>
      <td className="px-3.5 py-2.5 text-right">
        <Button variant="secondary" onClick={onDispense} disabled={!stockItemId}>
          Dispense
        </Button>
        {error && <div className="mt-1 text-[11px] text-critical">{error}</div>}
      </td>
    </tr>
  );
}

export function PharmacyPage() {
  const [stock, setStock] = React.useState<StockItem[]>([]);
  const [pending, setPending] = React.useState<Order[]>([]);
  const [name, setName] = React.useState("");
  const [unit, setUnit] = React.useState("tablet");
  const [quantityOnHand, setQuantityOnHand] = React.useState("100");
  const [reorderLevel, setReorderLevel] = React.useState("20");

  const load = React.useCallback(() => {
    Promise.all([api<StockItem[]>("/pharmacy/stock"), api<Order[]>("/orders/pending?type=pharmacy")]).then(
      ([s, p]) => {
        setStock(s);
        setPending(p);
      },
    );
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onAddStock(e: React.FormEvent) {
    e.preventDefault();
    await api("/pharmacy/stock", {
      method: "POST",
      body: JSON.stringify({ name, unit, quantityOnHand: Number(quantityOnHand), reorderLevel: Number(reorderLevel) }),
    });
    setName("");
    load();
  }

  const lowStock = stock.filter((s) => s.quantityOnHand <= s.reorderLevel);

  return (
    <div className="flex flex-col gap-6">
      {lowStock.length > 0 && (
        <div className="rounded-lg border border-warning bg-warning-soft p-4 text-[13px] text-warning">
          <strong>{lowStock.length} item(s) at or below reorder level:</strong> {lowStock.map((s) => s.name).join(", ")}
        </div>
      )}

      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Pending prescriptions</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">Order</th>
                <th className="px-3.5 py-2.5">Ordered</th>
                <th className="px-3.5 py-2.5">Medicine</th>
                <th className="px-3.5 py-2.5">Qty</th>
                <th className="px-3.5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 && (
                <tr>
                  <td className="px-3.5 py-4 text-text-muted" colSpan={5}>
                    Nothing to dispense right now.
                  </td>
                </tr>
              )}
              {pending.map((o) => (
                <DispenseRow key={o.id} order={o} stock={stock} onDispensed={load} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h3 className="mb-4 text-[13.5px] font-bold">Add stock item</h3>
        <form onSubmit={onAddStock} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Unit</label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Quantity on hand</label>
            <input
              type="number"
              value={quantityOnHand}
              onChange={(e) => setQuantityOnHand(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Reorder level</label>
            <input
              type="number"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <Button type="submit" variant="primary">
              Add item
            </Button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Stock</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">Medicine</th>
                <th className="px-3.5 py-2.5">On hand</th>
                <th className="px-3.5 py-2.5">Reorder level</th>
                <th className="px-3.5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-3.5 py-2.5 font-semibold">{s.name}</td>
                  <td className="px-3.5 py-2.5 font-mono">
                    {s.quantityOnHand} {s.unit}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-text-faint">{s.reorderLevel}</td>
                  <td className="px-3.5 py-2.5">
                    {s.quantityOnHand <= s.reorderLevel ? (
                      <Badge tone="warning">Low</Badge>
                    ) : (
                      <Badge tone="success">OK</Badge>
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
