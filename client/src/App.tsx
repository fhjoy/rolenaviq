import { Navigate, Route, Routes } from "react-router";

import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardPage />} />

      <Route path="/applications" element={<ApplicationsPage />} />
    </Routes>
  );
}

export default App;
