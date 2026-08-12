import { Bell, MessageSquare, Plus, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Topbar({ title, crumb }: { title: string; crumb: string }) {
  const { user, logout } = useAuth();
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-border px-6 py-3.5">
      <div>
        <h1 className="text-[17px] font-bold">{title}</h1>
        <div className="text-[11.5px] text-text-faint">{crumb}</div>
      </div>

      <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-full border border-border bg-surface-2 px-3.5 py-2">
        <Search className="h-3.5 w-3.5 text-text-faint" />
        <input
          type="text"
          placeholder="Search patient, invoice, MRN…"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-text-faint"
        />
      </div>

      <button
        type="button"
        aria-label="Quick add"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-sm bg-accent text-white hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Notifications"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-sm border border-border bg-surface"
      >
        <Bell className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Messages"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-sm border border-border bg-surface"
      >
        <MessageSquare className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-2 rounded-sm px-1.5 py-1 hover:bg-surface-2"
        title="Log out"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold text-accent-strong">
          {initials}
        </span>
        <span className="text-left">
          <span className="block text-[12.3px] font-bold leading-tight">{user?.name}</span>
          <span className="block text-[10.5px] leading-tight text-text-faint">{user?.roles?.[0]}</span>
        </span>
      </button>
    </header>
  );
}
