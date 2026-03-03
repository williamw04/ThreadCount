import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '../store';

vi.mock('@/shared/api/supabase');

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('renders email and password fields', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderLoginForm();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders Google sign-in button', () => {
    renderLoginForm();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('renders link to signup', () => {
    renderLoginForm();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), '123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('shows API error when login fails', () => {
    useAuthStore.setState({ error: 'Invalid credentials' });
    renderLoginForm();

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('disables buttons while loading', () => {
    useAuthStore.setState({ isLoading: true });
    renderLoginForm();

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled();
  });
});
