"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Auth hook wrapping Supabase session management.
 *
 * - On mount, checks for an existing session
 * - Subscribes to auth state changes (login/logout)
 * - Provides signIn/signOut helpers
 * - Exposes authError + retryAuth for connection failures
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      // Race against a timeout — when Supabase is paused, the fetch hangs
      // indefinitely (no response, no error). 8 seconds is enough for a
      // slow connection but short enough to not feel broken.
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), 8000)
        ),
      ]);
      if (result.error) throw result.error;
      setUser(result.data.session?.user ?? null);
    } catch (err) {
      // Import would create a circular-ish dependency, so inline the detection here
      const msg = err instanceof Error ? err.message : String(err);
      const lower = msg.toLowerCase();
      if (lower.includes("paused") || lower.includes("inactive")) {
        setAuthError("The database is paused due to inactivity. You can restart it from the Supabase dashboard.");
      } else if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("load failed") || lower.includes("timed out")) {
        setAuthError("Could not connect to the server. The database may be paused, or check your internet connection.");
      } else {
        setAuthError("Something went wrong. Try again in a moment.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [checkSession]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, authError, retryAuth: checkSession, signIn, signOut };
}
