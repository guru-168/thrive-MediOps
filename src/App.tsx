import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { OverviewPage } from "./pages/OverviewPage";
import { PatientsPage } from "./pages/PatientsPage";
import { RiskAssessmentPage } from "./pages/RiskAssessmentPage";
import { FollowUpsPage } from "./pages/FollowUpsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      {/*
        AppShell is a layout route (renders <Outlet/>) so the sidebar and
        top bar - and their state, like the search query and notification
        read status - persist across navigation instead of remounting on
        every route change.
      */}
      <Route element={<AppShell />}>
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
