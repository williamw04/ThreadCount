import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/shared/ui/Button';
import { getAvatar, processAvatar } from '@/features/profile/api';
import { supabase } from '@/shared/api/supabase';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const [avatar, setAvatar] = useState<{
    original_photo_path?: string;
    model_canvas_path?: string;
    model_status?: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvatar = useCallback(async () => {
    if (!user) return;
    const data = await getAvatar(user.id);
    setAvatar(data);
  }, [user]);

  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);

  const handleRegenerate = async () => {
    if (!user) return;
    setIsGenerating(true);
    setError(null);
    try {
      console.log('Starting avatar generation...');
      await processAvatar(user.id);
      console.log('Avatar generation complete');
      await loadAvatar();
    } catch (err) {
      console.error('Avatar generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate avatar');
    } finally {
      setIsGenerating(false);
    }
  };

  const getAvatarUrl = (path: string) => {
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with rule */}
        <div className="flex items-end justify-between mb-4">
          <h1
            className="text-4xl text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Dashboard
          </h1>
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
        <div className="border-t border-[var(--border-strong)] mb-12" />

        {/* Welcome */}
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
          Welcome back
          {user?.email ? (
            <>
              ,{' '}
              <span
                className="text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {user.email}
              </span>
            </>
          ) : (
            ''
          )}
          . Your wardrobe awaits.
        </p>

        {/* Avatar Section */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 mb-6">
          <h2
            className="text-xl text-[var(--text-primary)] mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Your Avatar
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] rounded text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {avatar ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* Original Photo */}
                {avatar.original_photo_path && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                      Original
                    </p>
                    <div className="w-32 h-40 rounded-lg overflow-hidden bg-[var(--bg)]">
                      <img
                        src={getAvatarUrl(avatar.original_photo_path)}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Model Canvas */}
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Model Canvas
                  </p>
                  {avatar.model_canvas_path ? (
                    <div className="w-32 h-40 rounded-lg overflow-hidden bg-[var(--bg)]">
                      <img
                        src={getAvatarUrl(avatar.model_canvas_path)}
                        alt="Model Canvas"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-40 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {avatar.model_status === 'processing' ? 'Generating...' : 'Not generated'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-xs text-[var(--text-tertiary)]">
                  Status: <span className="uppercase">{avatar.model_status || 'pending'}</span>
                </p>
                <Button size="sm" onClick={handleRegenerate} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Regenerate Avatar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                You haven't uploaded an avatar yet.
              </p>
              <Button onClick={() => (window.location.href = '/onboarding')}>Set Up Avatar</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
