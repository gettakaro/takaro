import { Component, FC, PropsWithChildren, ReactNode } from 'react';
import { ErrorFallback } from '@takaro/lib-components';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ReactErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console instead of Sentry
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

export const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  return <ReactErrorBoundary>{children}</ReactErrorBoundary>;
};
