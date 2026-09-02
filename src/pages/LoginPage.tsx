import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthTextField } from "../components/auth/AuthTextField";
import { Button } from "../components/ui/Button";
import { MaterialSymbol } from "../components/icons/MaterialSymbol";
import { useAuth } from "../context/AuthContext";

interface FieldErrors {
  email?: string;
  password?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Email/password sign-in. Redirects to the dashboard on success (handled by PublicOnlyRoute once the session updates). */
export function LoginPage() {
  const { signIn, error: authError, configError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    clearError();
    if (!validate()) return;

    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (!error) {
      const redirectFrom = (location.state as { from?: { pathname?: string } } | null)?.from;
      navigate(redirectFrom?.pathname ?? "/", { replace: true });
    }
  }

  return (
    <AuthLayout title="Sign In" subtitle="Sign in to access the clinical dashboard.">
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorText={fieldErrors.password}
          />

          {authError && (
            <div className="flex items-start gap-stack-sm bg-error-container rounded-sm px-stack-sm py-2">
              <MaterialSymbol name="error" className="!text-base text-on-error-container shrink-0 mt-0.5" />
              <p className="font-body-sm text-body-sm text-on-error-container">{authError}</p>
            </div>
          )}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? "Signing In…" : "Sign In"}
          </Button>
        </form>
      )}

      <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-on-surface font-medium hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
