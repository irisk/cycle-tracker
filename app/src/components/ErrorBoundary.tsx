"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * React error boundary — catches rendering crashes.
 * Shows a full-page fallback with a reload button.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center px-6 bg-bg-page">
          <div className="text-center max-w-xs">
            <h1 className="text-lg font-semibold text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-text-tertiary mb-6">
              The app ran into an unexpected error. Reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-semibold text-white px-6 py-2.5 rounded-2xl bg-green"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
