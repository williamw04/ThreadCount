import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/shared/ui/Button';
import { PhotoUpload } from '../components/PhotoUpload';
import {
  uploadAvatarPhoto,
  createAvatar,
  updateProfile,
  processAvatar,
} from '@/features/profile/api';

export function OnboardingPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<'upload' | 'processing' | 'success'>('upload');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePhotoSelected = (_file: File) => {
    setUploadError(null);
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { path } = await uploadAvatarPhoto(user.id, file);
    await createAvatar(user.id, path);
  };

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

  const handleSkip = async () => {
    if (user) {
      await updateProfile(user.id, { onboarding_completed: true });
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl text-[var(--text-primary)] mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Welcome to Seamless
          </h1>
          <p
            className="text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Let&apos;s set up your profile
          </p>
        </div>

        <div className="border-t border-[var(--border-strong)] mb-8" />

        {step === 'upload' && (
          <>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 mb-6">
              <p
                className="text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-4"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Signed in as
              </p>
              <p
                className="text-sm text-[var(--text-primary)] mb-6"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {user?.email ?? 'unknown'}
              </p>

              {uploadError && (
                <div className="mb-4 p-3 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] rounded text-sm text-[var(--error)]">
                  {uploadError}
                </div>
              )}

              <PhotoUpload
                onPhotoSelected={handlePhotoSelected}
                onUpload={handleUpload}
                onContinue={handleContinue}
                onSkip={handleSkip}
              />
            </div>

            <Button variant="ghost" size="sm" onClick={logout} className="w-full">
              Log out
            </Button>
          </>
        )}

        {step === 'processing' && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)] bg-opacity-10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg
                className="w-8 h-8 text-[var(--accent)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h2
              className="text-xl text-[var(--text-primary)] mb-2"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Creating Your Avatar
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">Generating your model canvas...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--success)] bg-opacity-10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[var(--success)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2
              className="text-xl text-[var(--text-primary)] mb-2"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Avatar Ready!
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Redirecting you to the dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
