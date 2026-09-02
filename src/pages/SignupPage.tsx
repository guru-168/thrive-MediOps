import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthTextField } from "../components/auth/AuthTextField";
import { Button } from "../components/ui/Button";
import { MaterialSymbol } from "../components/icons/MaterialSymbol";
import { useAuth } from "../context/AuthContext";

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Email/password sign-up. Supabase projects commonly require confirming
 * the email address before a session exists, so a successful signUp() call
 * doesn't always mean the user is now logged in - this shows a clear
 * "check your email" confirmation instead of assuming the dashboard.
 */
export function SignupPage() {
  const { signUp, error: authError, configError, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

    if (!password) errors.password = "Password is required.";
    else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    clearError();
    if (!validate()) return;

    setSubmitting(true);
    const { error } = await signUp(email.trim(), password);
    setSubmitting(false);

    if (!error) {
      // If the project doesn't require email confirmation, onAuthStateChange
      // will already have picked up the new session by the time we'd
      // navigate, and ProtectedRoute/PublicOnlyRoute route accordingly. If
      // it does require confirmation, there's no session yet - show that
      // state instead of silently doing nothing.
      setConfirmationSent(true);
    }
  }

  if (confirmationSent) {
    return (
      <AuthLayout title="Check Your Email" subtitle="Almost there.">
        <div className="flex flex-col items-center text-center gap-stack-sm py-stack-sm">
          <MaterialSymbol name="mark_email_read" className="!text-4xl text-on-surface-variant" />
          <p className="font-body-sm text-body-sm text-on-surface">
            We sent a confirmation link to <span className="font-medium">{email.trim()}</span>. Confirm
            your email, then sign in below.
          </p>
        </div>
        <Button variant="primary" className="w-full" onClick={() => navigate("/login")}>
          Go to Sign In
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account" subtitle="Sign up to access the clinical dashboard.">
      {configError ? (
        <div className="flex items-start gap-stack-sm bg-error-container rounded-sm px-stack-sm py-2">
          <MaterialSymbol name="error" className="!text-base text-on-error-container shrink-0 mt-0.5" />
          <p className="font-body-sm text-body-sm text-on-error-container">{configError}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-stack-md">
          <AuthTextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            errorText={fieldErrors.email}
          />
          <AuthTextField
            label="Password"
            isPassword
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorText={fieldErrors.password}
          />
          <AuthTextField
            label="Confirm Password"
            isPassword
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            errorText={fieldErrors.confirmPassword}
          />

          {authError && (
            <div className="flex items-start gap-stack-sm bg-error-container rounded-sm px-stack-sm py-2">
              <MaterialSymbol name="error" className="!text-base text-on-error-container shrink-0 mt-0.5" />
              <p className="font-body-sm text-body-sm text-on-error-container">{authError}</p>
            </div>
          )}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? "Creating Account…" : "Create Account"}
          </Button>
        </form>
      )}

      <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-on-surface font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
