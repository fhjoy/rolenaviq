import { Navigate, Route, Routes } from "react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";

import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { BoardPage } from "@/pages/BoardPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NewApplicationPage } from "@/pages/NewApplicationPage";
import { ApplicationDetailsPage } from "@/pages/ApplicationDetailsPage";
import { EditApplicationPage } from "@/pages/EditApplicationPage";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/applications/new" element={<NewApplicationPage />} />
          <Route
            path="/applications/:id"
            element={<ApplicationDetailsPage />}
          />
          <Route
            path="/applications/:id/edit"
            element={<EditApplicationPage />}
          />
        </Route>
      </Route>

      {/* Not found */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
