"use client";

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Detects common Supabase error patterns and returns a user-friendly message.
 */
export function friendlyErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();

  if (lower.includes("paused") || lower.includes("inactive")) {
    return "The database is paused due to inactivity. You can restart it from the Supabase dashboard.";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("load failed") ||
    lower.includes("timed out")
  ) {
    return "Could not connect to the server. The database may be paused, or check your internet connection.";
  }
  if (lower.includes("jwt expired") || lower.includes("auth token") || lower.includes("unauthorized")) {
    return "Your session has expired. Try signing out and back in.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Your email address has not been confirmed yet.";
  }
  if (lower.includes("not authenticated")) {
    return "You are no longer signed in. Please reload and sign in again.";
  }

  return "Something went wrong. Try again in a moment.";
}

/** Inline error card with retry button. Styled for Cycle Tracker's warm palette. */
export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-2xl border-[1.5px] border-flow-heavy/20 bg-flow-bg-selected px-4 py-4 text-center">
      <p className="text-sm text-flow-heavy">
        {message ?? "Something went wrong."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-flow-heavy underline underline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
