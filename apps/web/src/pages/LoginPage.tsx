import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface LoginResponse {
  accessToken: string;
  user: { id: string; name: string; email: string; roles: string[] };
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tenantId, setTenantId] = React.useState("");
  const [email, setEmail] = React.useState("admin@sunrise.test");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ tenantId, email, password }),
      });
      login(res.accessToken, res.user as never);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-2 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border border-border bg-surface p-7 shadow-card">
        <div className="mb-6">
          <div className="mb-3 h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent-strong" />
          <h1 className="text-lg font-bold">Sign in to HMS</h1>
          <p className="text-[13px] text-text-muted">Enter your hospital's workspace details.</p>
        </div>

        <div className="mb-3.5 flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold text-text-muted" htmlFor="tenantId">
            Tenant ID
          </label>
          <input
            id="tenantId"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="from `pnpm seed` output"
            className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm font-mono outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            required
          />
        </div>
        <div className="mb-3.5 flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold text-text-muted" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            required
          />
        </div>
        <div className="mb-5 flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold text-text-muted" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-sm border border-border-strong bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            required
          />
        </div>

        {error && <p className="mb-4 text-[12.5px] font-medium text-critical">{error}</p>}

        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
