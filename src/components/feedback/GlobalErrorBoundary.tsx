/**
 * Global Error Boundary
 *
 * Catches JavaScript errors anywhere in the component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 *
 * Tone: Calm, reassuring, not alarming.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, Button } from "react-native";
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
    // Log error to observability service
    console.error("[GlobalErrorBoundary] Caught error:", error, errorInfo);

    // Future: send to crash reporting service
    // crashReporting.logError(error, errorInfo);
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
