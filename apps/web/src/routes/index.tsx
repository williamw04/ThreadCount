import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { WardrobePage } from '@/features/wardrobe/pages/WardrobePage';
import { OutfitBuilderPage } from '@/features/outfit-builder/pages/OutfitBuilderPage';
import { LooksPage } from '@/features/looks/pages/LooksPage';
import { AppShell } from '@/shared/layout/AppShell';

/**
 * Central route configuration.
 *
 * Route nesting serves a layout purpose:
 *   ProtectedRoute (auth guard) → AppShell (header/nav chrome) → pages
 *
 * ProtectedRoute checks the auth store and redirects unauthenticated users
 * to /login. AppShell renders the shared header and an <Outlet> for child routes.
 *
 * The outfit-builder route lives inside AppShell but uses a viewport-locked
 * layout (100dvh, no scroll) — AppShell detects this via the URL and adapts
 * its header and main area styles. See ARCHITECTURE.md for the full route map.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes — no auth required */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected routes — wrapped by auth guard then layout shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/looks" element={<LooksPage />} />
          <Route path="/outfit-builder" element={<OutfitBuilderPage />} />

          {/* Planned routes — see ARCHITECTURE.md "Planned Route Placeholders" */}
          {/* <Route path="/outfits" element={<SavedOutfitsPage />} /> */}
          {/* <Route path="/previous-looks" element={<PreviousLooksPage />} /> */}
          {/* <Route path="/analysis" element={<AnalysisPage />} /> */}
          {/* <Route path="/profile" element={<ProfilePage />} /> */}
        </Route>
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch-all redirect — prevents blank pages on unknown paths */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
