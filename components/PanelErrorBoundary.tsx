"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
};

type State = { hasError: boolean };

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[${this.props.label}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <p className="font-semibold">{this.props.label} could not render.</p>
          <p className="mt-1 text-amber-900/90">
            Try reloading the page. Your data remains saved locally if storage is available.
          </p>
          <button
            type="button"
            className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-sm hover:bg-amber-100/80"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
