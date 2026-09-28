import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessIndexRedirect } from "@/pages/business/BusinessIndexRedirect";
import { ConnectionsPage } from "@/pages/business/ConnectionsPage";
import { OverviewPage } from "@/pages/business/OverviewPage";
import { PerformancePage } from "@/pages/business/PerformancePage";
import { SettingsPage } from "@/pages/business/SettingsPage";
import { SiteHealthPage } from "@/pages/business/SiteHealthPage";
import { StubPage } from "@/pages/business/StubPage";
import { stubCopy } from "@/pages/business/stubCopy";
import { BusinessLayout } from "@/pages/BusinessLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/businesses/:id"
            element={
              <ProtectedRoute>
                <BusinessLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BusinessIndexRedirect />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="local-visibility" element={<StubPage copy={stubCopy.localVisibility} />} />
            <Route path="opportunities" element={<StubPage copy={stubCopy.opportunities} />} />
            <Route path="pages" element={<StubPage copy={stubCopy.pages} />} />
            <Route path="manager" element={<StubPage copy={stubCopy.manager} />} />
            <Route path="approvals" element={<StubPage copy={stubCopy.approvals} />} />
            <Route path="site-health" element={<SiteHealthPage />} />
            <Route path="authority" element={<StubPage copy={stubCopy.authority} />} />
            <Route path="connections" element={<ConnectionsPage />} />
            <Route path="work" element={<StubPage copy={stubCopy.work} />} />
            <Route path="history" element={<StubPage copy={stubCopy.history} />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
