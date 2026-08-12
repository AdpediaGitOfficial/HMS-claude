import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  BedDouble,
  FileText,
  FlaskConical,
  Droplet,
  Pill,
  Ambulance,
  Share2,
  Baby,
  Receipt,
  ShieldCheck,
  UserCog,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { modulesForRole, type ModuleGroup, type RoleKey } from "@hms/shared";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  patients: Users,
  appointments: CalendarDays,
  opd: Stethoscope,
  ipd: BedDouble,
  ehr: FileText,
  lab_radiology: FlaskConical,
  blood_bank: Droplet,
  pharmacy: Pill,
  ambulance: Ambulance,
  referral: Share2,
  birth_death: Baby,
  billing: Receipt,
  insurance_tpa: ShieldCheck,
  hr_payroll: UserCog,
  reports: BarChart3,
};

const GROUP_LABEL: Record<ModuleGroup, string> = {
  overview: "Overview",
  clinical: "Clinical",
  operations: "Operations",
  finance: "Finance",
  administration: "Administration",
};

const GROUP_ORDER: ModuleGroup[] = ["overview", "clinical", "operations", "finance", "administration"];

/**
 * Nav items are never hand-listed per screen — they're filtered from the
 * shared MODULES catalog by the caller's role (§5 role → module matrix),
 * so a new module becomes visible to the right roles the moment it's
 * added to @hms/shared, with no change to this component.
 */
export function Sidebar({ role }: { role: RoleKey }) {
  const modules = modulesForRole(role);
  const byGroup = GROUP_ORDER.map((group) => ({
    group,
    items: modules.filter((m) => m.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="w-[250px] shrink-0 border-r border-border bg-surface p-3.5 flex flex-col">
      <div className="flex items-center gap-2.5 px-1.5 pb-4 pt-0.5">
        <div className="h-[30px] w-[30px] rounded-[9px] bg-gradient-to-br from-accent to-accent-strong" />
        <div>
          <div className="text-[15px] font-bold leading-tight">HMS</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {byGroup.map(({ group, items }) => (
          <div key={group} className="mb-1">
            <div className="px-2.5 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-wider text-text-faint first:pt-0.5">
              {GROUP_LABEL[group]}
            </div>
            {items.map((m) => {
              const Icon = ICONS[m.key] ?? LayoutDashboard;
              return (
                <NavLink
                  key={m.key}
                  to={`/${m.key === "dashboard" ? "" : m.key}`}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[12.8px] font-semibold text-text-muted hover:bg-surface-2 hover:text-text",
                      isActive && "bg-accent-soft text-accent-strong hover:bg-accent-soft hover:text-accent-strong",
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {m.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
