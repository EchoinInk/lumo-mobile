/**
 * ErrorBoundary Component
 *
 * Production-safe error boundary for React trees.
 * Graceful fallback rendering with calm UX.
 */

import { useTheme } from "@/hooks/use-theme";
import { Colors } from "@/theme/colors";
import React, { Component, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging (console only - no analytics)
    console.warn("[ErrorBoundary] Render error:", error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorBoundaryFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorBoundaryFallbackProps {
  onReset: () => void;
}

const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  onReset,
}) => {
  const { isDark } = useTheme();

  return <ErrorBoundaryInner isDark={isDark} onReset={onReset} />;
};

const ErrorBoundaryInner: React.FC<{
  isDark: boolean;
  onReset: () => void;
}> = ({ isDark, onReset }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: isDark ? Colors.textPrimary : Colors.textPrimary },
          ]}
        >
          Something didn't work
        </Text>
        <Text
          style={[
            styles.description,
            { color: isDark ? Colors.textSecondary : Colors.textSecondary },
          ]}
        >
          Let's try that again together.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.primary }]}
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
});
