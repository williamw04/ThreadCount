import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';

vi.mock('@/shared/api/supabase');

function renderAppShell(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route path="dashboard" element={<div>Dashboard page</div>} />
          <Route path="wardrobe" element={<div>Wardrobe page</div>} />
          <Route path="outfit-builder" element={<div>Builder page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppShell', () => {
  afterEach(() => {
    document.body.classList.remove('builder-active');
  });

  it('toggles body.builder-active when navigating into and out of the builder route', async () => {
    const user = userEvent.setup();
    renderAppShell('/dashboard');

    expect(document.body).not.toHaveClass('builder-active');

    await user.click(screen.getByRole('link', { name: /^Builder$/i }));

    await waitFor(() => {
      expect(screen.getByText('Builder page')).toBeInTheDocument();
      expect(document.body).toHaveClass('builder-active');
    });

    await user.click(screen.getByRole('link', { name: /^Dashboard$/i }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard page')).toBeInTheDocument();
      expect(document.body).not.toHaveClass('builder-active');
    });
  });

  it('does not add body.builder-active on non-builder routes', () => {
    renderAppShell('/wardrobe');

    expect(screen.getByText('Wardrobe page')).toBeInTheDocument();
    expect(document.body).not.toHaveClass('builder-active');
  });

  it('applies viewport-locked builder layout classes to the header and main region', () => {
    renderAppShell('/outfit-builder');

    expect(screen.getByRole('banner')).toHaveClass(
      'bg-[var(--bg)]',
      'border-b',
      'border-[var(--border)]',
    );
    expect(screen.getByRole('main')).toHaveClass(
      'h-[100vh]',
      'h-[100dvh]',
      'overflow-hidden',
      'px-0',
      'pb-0',
      'pt-[var(--header-h)]',
    );
  });
});
