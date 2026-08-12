import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PatientsPage } from "@/pages/PatientsPage";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell title="Dashboard" crumb="Home / Dashboard" />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
      </Route>
      <Route
        path="/patients"
        element={
          <RequireAuth>
            <AppShell title="Patients" crumb="Home / Patients" />
          </RequireAuth>
        }
      >
        <Route index element={<PatientsPage />} />
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
