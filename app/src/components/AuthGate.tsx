"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import ErrorBanner, { friendlyErrorMessage } from "@/components/ErrorBanner";

/**
 * AuthGate — wraps the app, shows login form if not authenticated.
 *
 * Simple email + password form. No signup flow — the user account
 * is created manually in the Supabase Dashboard (single-user app).
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, authError, retryAuth, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Skip auth in mock mode (local dev / screenshots)
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-page">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-green border-t-transparent" />
      </div>
    );
  }

  // Connection error (e.g. database paused, network down)
  if (authError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-page px-6">
        <div className="w-full max-w-sm">
          <h1 className="mb-8 text-center text-[26px] font-semibold tracking-tight text-text-primary">
            Cycle Tracker
          </h1>
          <ErrorBanner
            message={authError}
            onRetry={retryAuth}
          />
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
    } catch (err: unknown) {
      setError(friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-page px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-[26px] font-semibold tracking-tight text-text-primary">
          Cycle Tracker
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 rounded-xl border-[1.5px] border-border-subtle bg-bg-card px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-strong focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 rounded-xl border-[1.5px] border-border-subtle bg-bg-card px-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-strong focus:outline-none"
          />

          {error && (
            <p className="text-center text-sm text-flow-heavy">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-14 items-center justify-center rounded-2xl bg-green text-white disabled:opacity-60"
          >
            <span className="text-base font-semibold">
              {submitting ? "Signing in..." : "Sign In"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
