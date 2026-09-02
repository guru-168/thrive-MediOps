import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { OverviewPage } from "./pages/OverviewPage";
import { PatientsPage } from "./pages/PatientsPage";
import { RiskAssessmentPage } from "./pages/RiskAssessmentPage";
import { FollowUpsPage } from "./pages/FollowUpsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";

export default function App() {
  return (
    <Routes>
      {/* Public auth routes - redirect to the dashboard if already signed in. */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />

      {/*
        AppShell is a layout route (renders <Outlet/>) so the sidebar and
        top bar - and their state, like the search query and notification
        read status - persist across navigation instead of remounting on
        every route change. The whole group is gated behind ProtectedRoute,
        which redirects unauthenticated visitors to /login.
      */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
