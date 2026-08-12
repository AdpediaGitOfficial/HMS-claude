/**
 * Canonical module catalog — mirrors §3 of the architecture plan.
 * This is the single source of truth the sidebar nav (web) and the
 * permission seed (api) both generate from — a module's identity lives
 * here once, not hand-duplicated per screen.
 */

export type ModuleGroup =
  | "overview"
  | "clinical"
  | "operations"
  | "finance"
  | "administration";

export interface ModuleDef {
  key: string;
  label: string;
  group: ModuleGroup;
  /** Postgres schema that owns this module's tables (§11). */
  schema: string;
}

export const MODULES: ModuleDef[] = [
  { key: "dashboard", label: "Dashboard", group: "overview", schema: "core" },

  { key: "patients", label: "Patients", group: "clinical", schema: "core" },
  { key: "appointments", label: "Appointments", group: "clinical", schema: "clinical" },
  { key: "opd", label: "OPD", group: "clinical", schema: "clinical" },
  { key: "ipd", label: "IPD", group: "clinical", schema: "clinical" },
  { key: "ehr", label: "EHR", group: "clinical", schema: "clinical" },
  { key: "lab_radiology", label: "Lab & Radiology", group: "clinical", schema: "lab" },
  { key: "blood_bank", label: "Blood Bank", group: "clinical", schema: "records" },

  { key: "pharmacy", label: "Pharmacy", group: "operations", schema: "pharmacy" },
  { key: "ambulance", label: "Ambulance", group: "operations", schema: "records" },
  { key: "referral", label: "Referral", group: "operations", schema: "records" },
  { key: "birth_death", label: "Birth & Death Record", group: "operations", schema: "records" },

  { key: "billing", label: "Billing & Finance", group: "finance", schema: "billing" },
  { key: "insurance_tpa", label: "Insurance / TPA Claims", group: "finance", schema: "billing" },

  { key: "hr_payroll", label: "Human Resource", group: "administration", schema: "hr" },
  { key: "reports", label: "Reports", group: "administration", schema: "core" },
];

/** System role keys — seeded per tenant on onboarding. */
export type RoleKey =
  | "super_admin"
  | "admin"
  | "doctor"
  | "nurse"
  | "receptionist"
  | "pharmacist"
  | "lab_tech"
  | "radiologist"
  | "accountant";

/**
 * Role → module visibility (§5). Drives both the sidebar nav filter and
 * the seeded role_permissions rows — one definition, not two.
 */
export const ROLE_MODULES: Record<RoleKey, string[]> = {
  super_admin: MODULES.map((m) => m.key),
  admin: MODULES.filter((m) => m.key !== "platform").map((m) => m.key),
  doctor: [
    "dashboard", "patients", "appointments", "opd", "ipd", "ehr",
    "lab_radiology", "blood_bank", "ambulance", "referral", "reports",
  ],
  nurse: ["dashboard", "patients", "opd", "ipd", "ehr", "blood_bank", "reports"],
  receptionist: ["dashboard", "patients", "appointments", "opd", "billing", "referral"],
  pharmacist: ["dashboard", "patients", "billing", "opd", "ipd", "pharmacy", "blood_bank", "reports"],
  lab_tech: ["dashboard", "patients", "billing", "opd", "ipd", "lab_radiology", "blood_bank", "reports"],
  radiologist: ["dashboard", "patients", "billing", "opd", "ipd", "lab_radiology", "reports"],
  accountant: ["dashboard", "patients", "billing", "insurance_tpa", "hr_payroll", "reports"],
};

export function modulesForRole(role: RoleKey): ModuleDef[] {
  const allowed = new Set(ROLE_MODULES[role] ?? []);
  return MODULES.filter((m) => allowed.has(m.key));
}
