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
