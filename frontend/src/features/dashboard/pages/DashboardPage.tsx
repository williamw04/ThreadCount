import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { PageIntro } from '@/shared/ui/PageIntro';
import { SurfaceMessage } from '@/shared/ui/SurfaceMessage';
import { getAvatar, processAvatar } from '@/features/profile/api';
import { supabase } from '@/shared/api/supabase';

function DashboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <p className="eyebrow text-[var(--text-muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] sm:text-4xl">
        {value}
      </p>
    </div>
  );
}

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<{
    original_photo_path?: string | null;
    model_canvas_path?: string | null;
    model_status?: string | null;
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
      await processAvatar(user.id);
      await loadAvatar();
    } catch (err) {
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 page-enter">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <PageIntro
          className="flex-1"
          eyebrow="Dashboard"
          title="Your private fashion workspace is live."
          description={`Welcome back${user?.email ? `, ${user.email}` : ''}. Review the model canvas, verify the archive status, and return to styling.`}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void logout()}
          className="self-start xl:mb-6"
        >
          Log out
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardMetric
          label="Avatar status"
          value={(avatar?.model_status || 'Pending').toUpperCase()}
        />
        <DashboardMetric
          label="Source image"
          value={avatar?.original_photo_path ? 'Ready' : 'Missing'}
        />
        <DashboardMetric
          label="Canvas image"
          value={avatar?.model_canvas_path ? 'Ready' : 'Pending'}
        />
      </div>

      {error ? (
        <SurfaceMessage
          kicker="Avatar issue"
          title="Generation interrupted"
          description={error}
          className="text-left"
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.7fr)]">
        <Card className="border-[var(--border-strong)]" padding="none">
          <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
            <p className="eyebrow text-[var(--text-muted)]">Avatar review</p>
            <h2 className="mt-3 text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] sm:text-4xl">
              Model canvas
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Keep the source and processed image visible so you can check framing before moving
              deeper into the wardrobe and builder.
            </p>
          </div>

          {avatar ? (
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
              {avatar.original_photo_path ? (
                <section className="space-y-3">
                  <p className="eyebrow text-[var(--text-muted)]">Original capture</p>
                  <div className="aspect-[4/5] overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
                    <img
                      src={getAvatarUrl(avatar.original_photo_path)}
                      alt="Original avatar upload"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </section>
              ) : (
                <SurfaceMessage
                  kicker="Source"
                  title="No upload on record"
                  description="Return to onboarding to capture a clean full-body image."
                  className="min-h-[26rem] flex items-center justify-center"
                />
              )}

              {avatar.model_canvas_path ? (
                <section className="space-y-3">
                  <p className="eyebrow text-[var(--text-muted)]">Processed canvas</p>
                  <div className="aspect-[4/5] overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
                    <img
                      src={getAvatarUrl(avatar.model_canvas_path)}
                      alt="Processed model canvas"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </section>
              ) : (
                <SurfaceMessage
                  kicker="Canvas"
                  title={
                    avatar.model_status === 'processing'
                      ? 'Canvas in progress'
                      : 'Canvas not generated'
                  }
                  description={
                    avatar.model_status === 'processing'
                      ? 'The system is still preparing the processed model image.'
                      : 'Trigger a regeneration to produce the finished canvas.'
                  }
                  className="min-h-[26rem] flex items-center justify-center"
                />
              )}
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <SurfaceMessage
                kicker="No avatar"
                title="Start the capture flow"
                description="You have not uploaded an avatar yet. Complete onboarding to generate the model canvas."
              />
            </div>
          )}
        </Card>

        <aside className="space-y-6">
          <Card padding="md">
            <p className="eyebrow text-[var(--text-muted)]">Status</p>
            <p className="mt-4 text-2xl font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              {avatar?.model_status || 'Pending'}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Regenerate when you need a cleaner canvas or updated output for try-on generation.
            </p>
            <div className="mt-6 space-y-3">
              <Button
                size="sm"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Regenerate avatar'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/onboarding')}
                className="w-full"
              >
                Return to onboarding
              </Button>
            </div>
          </Card>

          <SurfaceMessage
            kicker="Next"
            title="Continue into the archive"
            description="Use the wardrobe to manage garments or move into the builder to start composing the next silhouette."
            className="text-left"
          />
        </aside>
      </div>
    </div>
  );
}
