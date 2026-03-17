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
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M21 12.23c0-.76-.07-1.49-.2-2.2H12v4.17h5.03a4.31 4.31 0 0 1-1.87 2.82v2.74h3.03c1.77-1.63 2.81-4.04 2.81-6.53Z" />
          <path d="M12 21c2.54 0 4.68-.83 6.24-2.24l-3.03-2.74c-.84.57-1.92.92-3.21.92-2.47 0-4.57-1.66-5.31-3.89H3.57v2.83A9.42 9.42 0 0 0 12 21Z" />
          <path d="M6.69 13.05A5.65 5.65 0 0 1 6.37 12c0-.36.11-.72.32-1.05V8.12H3.57A9.02 9.02 0 0 0 2.5 12c0 1.44.35 2.79 1.07 3.88l3.12-2.83Z" />
          <path d="M12 7.08c1.39 0 2.64.48 3.62 1.42l2.7-2.7C16.67 4.3 14.53 3.5 12 3.5a9.42 9.42 0 0 0-8.43 4.62l3.12 2.83c.74-2.22 2.84-3.87 5.31-3.87Z" />
        </svg>
        Continue with Google
      </Button>

      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-[var(--border)]" />
        <span className="eyebrow text-[var(--text-muted)]">or</span>
        <div className="flex-1 border-t border-[var(--border)]" />
      </div>

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
          <p
            className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-primary)]"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </div>
      </form>

      <p className="text-center text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="text-[var(--text-primary)] underline underline-offset-4 hover:opacity-60"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
