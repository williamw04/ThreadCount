/**
 * DashboardPage avatar loading: initial fetch, fetch failure, regenerate,
 * and no state update after unmount.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { useAuthStore } from '@/features/auth/store';
import { getAvatar, processAvatar } from '@/features/profile/api';

vi.mock('@/shared/api/supabase');
vi.mock('@/features/profile/api', () => ({
  getAvatar: vi.fn(),
  processAvatar: vi.fn(),
}));

const pending = { model_status: 'pending', original_photo_path: null, model_canvas_path: null };
const ready = { model_status: 'ready', original_photo_path: null, model_canvas_path: null };

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(getAvatar).mockReset();
    vi.mocked(processAvatar).mockReset();
    useAuthStore.setState({ user: { id: 'u1', email: 'u@example.com' }, isAuthenticated: true });
  });

  it('loads the avatar on mount', async () => {
    vi.mocked(getAvatar).mockResolvedValue(pending as never);
    renderPage();
    expect(await screen.findByText('PENDING')).toBeInTheDocument();
    expect(getAvatar).toHaveBeenCalledWith('u1');
  });

  it('shows the error when the initial load fails', async () => {
    vi.mocked(getAvatar).mockRejectedValue(new Error('db down'));
    renderPage();
    expect(await screen.findByText('db down')).toBeInTheDocument();
  });

  it('uses the avatar returned by processAvatar on regenerate', async () => {
    vi.mocked(getAvatar).mockResolvedValue(pending as never);
    vi.mocked(processAvatar).mockResolvedValue(ready as never);
    renderPage();
    await screen.findByText('PENDING');
    await userEvent.click(screen.getByRole('button', { name: /regenerate avatar/i }));
    expect(await screen.findByText('READY')).toBeInTheDocument();
    expect(getAvatar).toHaveBeenCalledTimes(1);
  });

  it('ignores a load that resolves after unmount', async () => {
    let resolve!: (value: unknown) => void;
    vi.mocked(getAvatar).mockReturnValue(new Promise((r) => (resolve = r)) as never);
    const { unmount } = renderPage();
    unmount();
    resolve(ready);
    await waitFor(() => expect(getAvatar).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('READY')).not.toBeInTheDocument();
  });
});
