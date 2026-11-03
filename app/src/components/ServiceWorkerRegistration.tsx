"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on mount (production only).
 * Renders nothing — just a side-effect component.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("SW registration failed:", err);
      });
    }
  }, []);

  return null;
}
