import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { LandingPage } from "@/pages/LandingPage";

const ApplicationsPage = lazy(() =>
  import("@/pages/ApplicationsPage").then((module) => ({
    default: module.ApplicationsPage,
  })),
);
const BoardPage = lazy(() =>
  import("@/pages/BoardPage").then((module) => ({ default: module.BoardPage })),
);
const CalendarPage = lazy(() =>
  import("@/pages/CalendarPage").then((module) => ({
    default: module.CalendarPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);
const NewApplicationPage = lazy(() =>
  import("@/pages/NewApplicationPage").then((module) => ({
    default: module.NewApplicationPage,
  })),
);
const ApplicationDetailsPage = lazy(() =>
  import("@/pages/ApplicationDetailsPage").then((module) => ({
    default: module.ApplicationDetailsPage,
  })),
);
const EditApplicationPage = lazy(() =>
  import("@/pages/EditApplicationPage").then((module) => ({
    default: module.EditApplicationPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);

function RouteFallback() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading page" role="status">
      <div className="space-y-3">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 rounded-2xl border bg-card" />
        ))}
      </div>
      <span className="sr-only">Loading page</span>
    </div>
  );
}

function lazyRoute(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

function publicLazyRoute(element: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <RouteFallback />
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={publicLazyRoute(<LoginPage />)} />
      <Route path="/register" element={publicLazyRoute(<RegisterPage />)} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={lazyRoute(<DashboardPage />)} />
          <Route path="/applications" element={lazyRoute(<ApplicationsPage />)} />
          <Route path="/board" element={lazyRoute(<BoardPage />)} />
          <Route path="/calendar" element={lazyRoute(<CalendarPage />)} />
          <Route path="/settings" element={lazyRoute(<SettingsPage />)} />
          <Route path="/applications/new" element={lazyRoute(<NewApplicationPage />)} />
          <Route
            path="/applications/:id"
            element={lazyRoute(<ApplicationDetailsPage />)}
          />
          <Route
            path="/applications/:id/edit"
            element={lazyRoute(<EditApplicationPage />)}
          />
        </Route>
      </Route>

      {/* Not found */}
      <Route path="*" element={publicLazyRoute(<NotFoundPage />)} />
    </Routes>
  );
}

export default App;
