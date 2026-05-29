/**
 * Global Error Boundary
 *
 * Catches JavaScript errors anywhere in the component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 *
 * Tone: Calm, reassuring, not alarming.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { observability } from "@/services/observability";
import { FatalErrorScreen } from "./FatalErrorScreen";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    observability.crashes.captureException(error, {
      feature: "global_error_boundary",
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <FatalErrorScreen
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
