import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useAuthStore } from '../store';
import { LoginSchema } from '../types';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login, loginGoogle, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    clearError();

    const result = LoginSchema.safeParse({ email, password });

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field) {
          errors[String(field)] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    await login(result.data);
  };

  const handleGoogleLogin = async () => {
    clearError();
    await loginGoogle();
  };

  return (
    <div className="space-y-6">
      {/* Google sign-in */}
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-[var(--border)]" />
        <span
          className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          or
        </span>
        <div className="flex-1 border-t border-[var(--border)]" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={fieldErrors['email']}
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          error={fieldErrors['password']}
          autoComplete="current-password"
          disabled={isLoading}
        />

        {error && (
          <p className="text-xs text-[var(--error)]" role="alert">
            {error}
          </p>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </div>
      </form>

      <p className="text-center text-xs text-[var(--text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="text-[var(--text-primary)] underline underline-offset-4 hover:text-[var(--accent)]"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
