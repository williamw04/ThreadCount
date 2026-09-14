import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useAuthStore } from '../store';
import { SignupSchema } from '../types';

// Signup form with dark (inverse) styling to contrast against the light signup page layout.
// Structurally mirrors LoginForm but adds confirmPassword and uses SignupSchema for validation.
export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { signup, loginGoogle, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    clearError();

    // SignupSchema.refine() handles cross-field password-match validation client-side.
    const result = SignupSchema.safeParse({ email, password, confirmPassword });

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

    await signup(result.data);
  };

  const handleGoogleSignup = async () => {
    clearError();
    await loginGoogle();
  };

  return (
    <div className="space-y-6 text-[var(--text-inverse)]">
      <Button
        type="button"
        variant="primary"
        className="w-full border border-[var(--border)] bg-[var(--text-primary)] text-[var(--text-inverse)]"
        onClick={handleGoogleSignup}
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
        <div className="flex-1 border-t border-[rgba(255,255,255,0.2)]" />
        <span className="eyebrow text-[var(--text-inverse)]/56">or</span>
        <div className="flex-1 border-t border-[rgba(255,255,255,0.2)]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={fieldErrors['email']}
          errorClassName="text-[var(--text-inverse)]"
          autoComplete="email"
          disabled={isLoading}
          className="border-[rgba(255,255,255,0.28)] bg-transparent text-[var(--text-inverse)] placeholder:text-[var(--text-inverse)]/44 focus:border-[var(--text-inverse)] focus:ring-[var(--text-inverse)]"
          labelClassName="text-[var(--text-inverse)]/72"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          error={fieldErrors['password']}
          errorClassName="text-[var(--text-inverse)]"
          autoComplete="new-password"
          disabled={isLoading}
          className="border-[rgba(255,255,255,0.28)] bg-transparent text-[var(--text-inverse)] placeholder:text-[var(--text-inverse)]/44 focus:border-[var(--text-inverse)] focus:ring-[var(--text-inverse)]"
          labelClassName="text-[var(--text-inverse)]/72"
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          error={fieldErrors['confirmPassword']}
          errorClassName="text-[var(--text-inverse)]"
          autoComplete="new-password"
          disabled={isLoading}
          className="border-[rgba(255,255,255,0.28)] bg-transparent text-[var(--text-inverse)] placeholder:text-[var(--text-inverse)]/44 focus:border-[var(--text-inverse)] focus:ring-[var(--text-inverse)]"
          labelClassName="text-[var(--text-inverse)]/72"
        />

        {error && (
          <p
            className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-inverse)]"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full border-[var(--text-inverse)] bg-[var(--text-inverse)] text-[var(--surface-inverse)] hover:opacity-80"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>

      <p className="text-center text-xs uppercase tracking-[0.14em] text-[var(--text-inverse)]/64">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-[var(--text-inverse)] underline underline-offset-4 hover:opacity-60"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
