import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SignupForm } from './SignupForm';
import { useAuthStore } from '../store';

vi.mock('@/shared/api/supabase');

function renderSignupForm() {
  return render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>,
  );
}

describe('SignupForm', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('renders all fields', () => {
    renderSignupForm();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('renders create account button', () => {
    renderSignupForm();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders Google sign-up button', () => {
    renderSignupForm();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('renders link to login', () => {
    renderSignupForm();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderSignupForm();

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'different');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderSignupForm();

    await user.type(screen.getByLabelText(/^email$/i), 'not-an-email');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  it('disables buttons while loading', () => {
    useAuthStore.setState({ isLoading: true });
    renderSignupForm();

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled();
  });
});
