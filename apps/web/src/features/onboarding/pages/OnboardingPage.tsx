import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/shared/ui/Button';
import { PageIntro } from '@/shared/ui/PageIntro';
import { SurfaceMessage } from '@/shared/ui/SurfaceMessage';
import { PhotoUpload } from '../components/PhotoUpload';
import {
  uploadAvatarPhoto,
  createAvatar,
  updateProfile,
  processAvatar,
} from '@/features/profile/api';

// Onboarding page orchestrates the avatar creation flow: upload → process → success.
// This page is protected by ProtectedRoute and is the first stop after auth.
//
// It crosses into the profile feature for API calls (uploadAvatarPhoto, createAvatar,
// processAvatar, updateProfile) because onboarding owns the UX but profile owns the data.
export function OnboardingPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  // Step state drives which UI block is visible. 'processing' is a waiting state while
  // the backend generates the model canvas via fal.ai.
  const [step, setStep] = useState<'upload' | 'processing' | 'success'>('upload');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePhotoSelected = (_file: File) => {
    setUploadError(null);
  };

  // Uploads the photo to Supabase Storage, then creates an avatar record in the DB.
  // These are two separate calls because storage upload and DB metadata are independent concerns.
  const handleUpload = async (file: File) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { path } = await uploadAvatarPhoto(user.id, file);
    await createAvatar(user.id, path);
  };

  // After the photo is uploaded, this kicks off the AI processing pipeline (fal.ai via backend).
  // On success, marks onboarding as complete in the profile and redirects to the dashboard.
  const handleContinue = async () => {
    if (!user) return;

    setStep('processing');
    setUploadError(null);

    try {
      await processAvatar(user.id);
      await updateProfile(user.id, { onboarding_completed: true });
      setStep('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to create avatar');
      setStep('upload');
    }
  };

  // Skip still marks onboarding as done so the user isn't routed back here on next login.
  // They can set up their avatar later from the dashboard.
  const handleSkip = async () => {
    if (user) {
      await updateProfile(user.id, { onboarding_completed: true });
    }
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 pb-8">
      <PageIntro
        eyebrow="Onboarding"
        title="Construct the model canvas before the collection."
        description="This capture step prepares your private avatar so the wardrobe, dashboard, and builder can stay image-first and clean."
      />

      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-6">
          {step === 'upload' && (
            <>
              {uploadError ? (
                <SurfaceMessage
                  kicker="Capture issue"
                  title="Upload interrupted"
                  description={uploadError}
                  className="text-left"
                />
              ) : null}

              <PhotoUpload
                onPhotoSelected={handlePhotoSelected}
                onUpload={handleUpload}
                onContinue={handleContinue}
                onSkip={handleSkip}
              />
            </>
          )}

          {step === 'processing' && (
            <div role="status" aria-live="polite">
              <SurfaceMessage
                kicker="Processing"
                title="Generating the model canvas"
                description="Your uploaded image is being processed into a clean styling surface. This may take a moment."
              />
            </div>
          )}

          {step === 'success' && (
            <div role="status" aria-live="polite">
              <SurfaceMessage
                kicker="Ready"
                title="Avatar prepared"
                description="The canvas is complete. Redirecting you into the dashboard now."
              />
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <SurfaceMessage
            kicker="Profile"
            title={user?.email ?? 'Unknown account'}
            description="This account will anchor your wardrobe library and generated looks."
            className="text-left"
          />
          <SurfaceMessage
            kicker="Sequence"
            title="Upload. Process. Enter."
            description="We keep this step direct: one clean portrait, one model canvas, then immediate access to the finished product surfaces."
            className="text-left"
          />
          <Button variant="ghost" size="sm" onClick={() => void logout()} className="w-full">
            Log out
          </Button>
        </aside>
      </div>
    </div>
  );
}
