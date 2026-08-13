import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { AppointmentsPage } from "@/pages/AppointmentsPage";
import { OpdQueuePage } from "@/pages/OpdQueuePage";
import { EhrLandingPage } from "@/pages/EhrLandingPage";
import { EncounterDetailPage } from "@/pages/EncounterDetailPage";
import { IpdPage } from "@/pages/IpdPage";
import { PharmacyPage } from "@/pages/PharmacyPage";
import { LabPage } from "@/pages/LabPage";
import { BloodBankPage } from "@/pages/BloodBankPage";
import { BillingPage } from "@/pages/BillingPage";
import { InvoiceDetailPage } from "@/pages/InvoiceDetailPage";
import { InsuranceClaimsPage } from "@/pages/InsuranceClaimsPage";
import { HrPage } from "@/pages/HrPage";
import { AmbulancePage } from "@/pages/AmbulancePage";
import { ReferralPage } from "@/pages/ReferralPage";
import { BirthDeathPage } from "@/pages/BirthDeathPage";
import { ReportsPage } from "@/pages/ReportsPage";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Section({ title, crumb }: { title: string; crumb: string }) {
  return (
    <RequireAuth>
      <AppShell title={title} crumb={crumb} />
    </RequireAuth>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Section title="Dashboard" crumb="Home / Dashboard" />}>
        <Route index element={<DashboardPage />} />
      </Route>

      <Route path="/patients" element={<Section title="Patients" crumb="Home / Patients" />}>
        <Route index element={<PatientsPage />} />
      </Route>

      <Route path="/appointments" element={<Section title="Appointments" crumb="Home / Appointments" />}>
        <Route index element={<AppointmentsPage />} />
      </Route>

      <Route path="/opd" element={<Section title="OPD" crumb="Home / OPD" />}>
        <Route index element={<OpdQueuePage />} />
      </Route>

      <Route path="/ehr" element={<Section title="EHR" crumb="Home / EHR" />}>
        <Route index element={<EhrLandingPage />} />
        <Route path=":encounterId" element={<EncounterDetailPage />} />
      </Route>

      <Route path="/ipd" element={<Section title="IPD" crumb="Home / IPD" />}>
        <Route index element={<IpdPage />} />
      </Route>

      <Route path="/pharmacy" element={<Section title="Pharmacy" crumb="Home / Pharmacy" />}>
        <Route index element={<PharmacyPage />} />
      </Route>

      <Route path="/lab_radiology" element={<Section title="Lab & Radiology" crumb="Home / Lab & Radiology" />}>
        <Route index element={<LabPage />} />
      </Route>

      <Route path="/blood_bank" element={<Section title="Blood Bank" crumb="Home / Blood Bank" />}>
        <Route index element={<BloodBankPage />} />
      </Route>

      <Route path="/billing" element={<Section title="Billing & Finance" crumb="Home / Billing & Finance" />}>
        <Route index element={<BillingPage />} />
        <Route path=":invoiceId" element={<InvoiceDetailPage />} />
      </Route>

      <Route path="/insurance_tpa" element={<Section title="Insurance / TPA Claims" crumb="Home / Insurance / TPA Claims" />}>
        <Route index element={<InsuranceClaimsPage />} />
      </Route>

      <Route path="/hr_payroll" element={<Section title="Human Resource" crumb="Home / Human Resource" />}>
        <Route index element={<HrPage />} />
      </Route>

      <Route path="/ambulance" element={<Section title="Ambulance" crumb="Home / Ambulance" />}>
        <Route index element={<AmbulancePage />} />
      </Route>

      <Route path="/referral" element={<Section title="Referral" crumb="Home / Referral" />}>
        <Route index element={<ReferralPage />} />
      </Route>

      <Route path="/birth_death" element={<Section title="Birth & Death Record" crumb="Home / Birth & Death Record" />}>
        <Route index element={<BirthDeathPage />} />
      </Route>

      <Route path="/reports" element={<Section title="Reports" crumb="Home / Reports" />}>
        <Route index element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
