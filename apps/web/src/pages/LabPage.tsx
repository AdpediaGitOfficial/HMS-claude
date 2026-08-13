import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface TestCatalogItem {
  id: string;
  name: string;
  category: "lab" | "radiology";
}
interface TestResult {
  id: string;
  orderId: string;
  testCatalogId: string;
  resultStatus: "pending" | "completed";
  createdAt: string;
}

function ResultRow({
  result,
  catalog,
  onReported,
}: {
  result: TestResult;
  catalog: TestCatalogItem[];
  onReported: () => void;
}) {
  const [value, setValue] = React.useState("");
  const test = catalog.find((c) => c.id === result.testCatalogId);

  async function onReport() {
    if (!value) return;
    await api(`/lab/results/${result.id}/report`, { method: "POST", body: JSON.stringify({ resultValue: value }) });
    onReported();
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3.5 py-2.5 font-semibold">{test?.name ?? result.testCatalogId}</td>
      <td className="px-3.5 py-2.5">
        <Badge tone={test?.category === "radiology" ? "info" : "neutral"}>{test?.category}</Badge>
      </td>
      <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-text-faint">
        {new Date(result.createdAt).toLocaleString()}
      </td>
      <td className="px-3.5 py-2.5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Result…"
          className="w-48 rounded-sm border border-border-strong bg-surface px-2 py-1.5 text-[12.5px]"
        />
      </td>
      <td className="px-3.5 py-2.5 text-right">
        <Button variant="secondary" onClick={onReport} disabled={!value}>
          Report
        </Button>
      </td>
    </tr>
  );
}

export function LabPage() {
  const [catalog, setCatalog] = React.useState<TestCatalogItem[]>([]);
  const [pending, setPending] = React.useState<TestResult[]>([]);
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<"lab" | "radiology">("lab");

  const load = React.useCallback(() => {
    Promise.all([api<TestCatalogItem[]>("/lab/catalog"), api<TestResult[]>("/lab/results/pending")]).then(
      ([c, p]) => {
        setCatalog(c);
        setPending(p);
      },
    );
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onAddTest(e: React.FormEvent) {
    e.preventDefault();
    await api("/lab/catalog", { method: "POST", body: JSON.stringify({ name, category }) });
    setName("");
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-[13.5px] font-bold">Worklist</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-text-faint">
                <th className="px-3.5 py-2.5">Test</th>
                <th className="px-3.5 py-2.5">Category</th>
                <th className="px-3.5 py-2.5">Ordered</th>
                <th className="px-3.5 py-2.5">Result</th>
                <th className="px-3.5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 && (
                <tr>
                  <td className="px-3.5 py-4 text-text-muted" colSpan={5}>
                    No pending tests.
                  </td>
                </tr>
              )}
              {pending.map((r) => (
                <ResultRow key={r.id} result={r} catalog={catalog} onReported={load} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h3 className="mb-4 text-[13.5px] font-bold">Test catalog</h3>
        <form onSubmit={onAddTest} className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Test name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="CBC, Chest X-Ray…"
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-text-muted">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "lab" | "radiology")}
              className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm"
            >
              <option value="lab">Lab</option>
              <option value="radiology">Radiology</option>
            </select>
          </div>
          <Button type="submit" variant="primary">
            Add test
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {catalog.map((c) => (
            <Badge key={c.id} tone={c.category === "radiology" ? "info" : "neutral"}>
              {c.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
