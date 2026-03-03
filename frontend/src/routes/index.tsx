import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Placeholder routes — add pages as domains are built */}
        {/* <Route path="/wardrobe" element={<WardrobePage />} /> */}
        {/* <Route path="/outfit-builder" element={<OutfitBuilderPage />} /> */}
        {/* <Route path="/outfits" element={<SavedOutfitsPage />} /> */}
        {/* <Route path="/previous-looks" element={<PreviousLooksPage />} /> */}
        {/* <Route path="/analysis" element={<AnalysisPage />} /> */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
